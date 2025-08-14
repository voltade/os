import { readFileSync } from 'node:fs';
import path from 'node:path';
import { zValidator } from '@hono/zod-validator';
import { symmetricDecrypt } from 'better-auth/crypto';
import { and, desc, eq } from 'drizzle-orm';
import * as jose from 'jose';
import yaml from 'yaml';
import z from 'zod';

import {
  jwks as jwksTable,
  organization as organizationTable,
} from '#drizzle/auth.ts';
import { environmentTable } from '#drizzle/environment';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { authMiddleware } from '#server/lib/auth';
import { db } from '#server/lib/db.ts';
import { signJwt } from '#server/lib/jwk.ts';
import { createEnvironmentSchema } from '#shared/schemas/environment.ts';

type Common = {
  id: string;
  slug: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  environmentId: string;
  environmentSlug: string;
  environmentName: string | null;
};

type Variables = Common & {
  environmentChartVersion: string;
  isProduction: boolean;
};

type Values = Record<string, unknown> & {
  global: Common & {
    publicKey: string;
    anonKey: string;
    serviceKey: string;
  };
};

interface Parameters {
  variables: Variables;
  values: Values;
}

export const route = factory
  .createApp()
  .post('/api/v1/getparams.execute', async (c) => {
    const results = await db
      .select()
      .from(environmentTable)
      .innerJoin(
        organizationTable,
        eq(environmentTable.organization_id, organizationTable.id),
      );

    let environmentChartVersion = appEnvVariables.ENVIRONMENT_CHART_VERSION;
    if (
      !environmentChartVersion ||
      import.meta.env.NODE_ENV === 'development'
    ) {
      const chartYaml = readFileSync(
        path.resolve(process.cwd(), '../../charts/environment/Chart.yaml'),
        'utf8',
      );
      const chartDocument = yaml.parseDocument(chartYaml);
      environmentChartVersion = chartDocument.get('version') as string;
    }

    // Pass the latest two JWKs to the PostgREST to be used as the JWT_SECRET config: https://docs.postgrest.org/en/v13/references/auth.html#asym-keys
    const jwks = await db
      .select()
      .from(jwksTable)
      .orderBy(desc(jwksTable.createdAt))
      .limit(2);
    const publicWebKeySet: jose.JSONWebKeySet = {
      keys: jwks.map((jwk) => {
        const publicKey = JSON.parse(jwk.publicKey) as jose.JWK_RSA_Public;
        return {
          ...publicKey,
          kid: jwk.id,
        };
      }),
    };
    const publicKey = JSON.stringify(publicWebKeySet);
    const alg = publicWebKeySet.keys[0].alg as string;

    // Decrypt the private key to be used for signing long-live anon and service_role tokens
    const decryptedPrivateKey = await symmetricDecrypt({
      key: appEnvVariables.AUTH_SECRET,
      data: JSON.parse(jwks[0].privateKey),
    });
    const privateWebKey = JSON.parse(
      decryptedPrivateKey,
    ) as jose.JWK_RSA_Private;
    const privateKey = await jose.importJWK(privateWebKey, alg);

    const parameters: Parameters[] = await Promise.all(
      results.map(async ({ organization, environment }) => {
        const common: Common = {
          id: `${organization.id}-${environment.id}`,
          slug: `${organization.slug}-${environment.slug}`,
          organizationId: organization.id,
          organizationSlug: organization.slug,
          organizationName: organization.name,
          environmentId: environment.id,
          environmentSlug: environment.slug,
          environmentName: environment.name,
        };
        return {
          variables: {
            ...common,
            environmentChartVersion,
            isProduction: environment.is_production,
          },
          values: {
            global: {
              ...common,
              publicKey,
              anonKey: await signJwt(alg, privateKey, 'anon', [
                organization.slug,
              ]),
              serviceKey: await signJwt(alg, privateKey, 'service_role', [
                organization.slug,
              ]),
            },
          },
        };
      }),
    );

    // https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Plugin/#http-server
    return c.json({
      output: {
        parameters,
      },
    });
  })
  .get('/:environmentSlug', authMiddleware(true), async (c) => {
    // biome-ignore lint/style/noNonNullAssertion: session is guaranteed to be set by the authMiddleware
    const { activeOrganizationId } = c.get('session')!;
    if (!activeOrganizationId) {
      return c.json({ error: 'No active organization' }, 400);
    }
    const { environmentSlug } = c.req.param();
    const environment = await db
      .select()
      .from(environmentTable)
      .where(
        and(
          eq(environmentTable.slug, environmentSlug),
          eq(environmentTable.organization_id, activeOrganizationId),
        ),
      )
      .limit(1);
    if (environment.length === 0) {
      return c.json({ error: 'Environment not found' }, 404);
    }
    return c.json(environment[0]);
  })
  .delete('/:environmentSlug', authMiddleware(true), async (c) => {
    // biome-ignore lint/style/noNonNullAssertion: session is guaranteed to be set by the authMiddleware
    const { activeOrganizationId } = c.get('session')!;
    if (!activeOrganizationId) {
      return c.json({ error: 'No active organization' }, 400);
    }
    const { environmentSlug } = c.req.param();
    const [environment] = await db
      .delete(environmentTable)
      .where(
        and(
          eq(environmentTable.slug, environmentSlug),
          eq(environmentTable.organization_id, activeOrganizationId),
        ),
      )
      .returning();
    if (!environment) {
      return c.json({ error: 'Environment not found' }, 404);
    }
    await fetch(`${appEnvVariables.DRIZZLE_GATEWAY_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'slots:delete',
        data: {
          id: `org-${environment.organization_id}-${environment.id}`,
        },
      }),
    });
    return c.json({ success: true });
  })
  .get(
    '/',
    authMiddleware(true),
    zValidator(
      'query',
      z.object({
        orgId: z.string(),
      }),
    ),
    async (c) => {
      const { orgId } = c.req.valid('query');
      const environments = await db
        .select()
        .from(environmentTable)
        .where(eq(environmentTable.organization_id, orgId));
      return c.json(environments);
    },
  )
  .post(
    '/',
    authMiddleware(true),
    zValidator('json', createEnvironmentSchema),
    async (c) => {
      // biome-ignore lint/style/noNonNullAssertion: session is guaranteed by the authMiddleware
      const { activeOrganizationId } = c.get('session')!;
      if (!activeOrganizationId) {
        return c.json({ error: 'No active organization' }, 400);
      }
      const body = c.req.valid('json');
      const [created] = await db
        .insert(environmentTable)
        .values({
          organization_id: activeOrganizationId,
          ...body,
        })
        .returning();
      return c.json(created);
    },
  );
