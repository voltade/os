import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { bearerAuth } from 'hono/bearer-auth';
import z from 'zod';

import { organization as organizationTable } from '#drizzle/auth.ts';
import { environmentTable } from '#drizzle/environment.ts';
import { BASE_DOMAIN } from '#server/const.ts';
import { platformEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { getCnpgStatus } from '#server/lib/cnpg.ts';
import { db } from '#server/lib/db.ts';
import { getKeyPair, signJwt } from '#server/lib/jwt.ts';
import { auth } from '#server/middlewares/auth.ts';
import { createEnvironmentSchema } from '#shared/schemas/environment.ts';

type Values = Record<string, unknown> & {
  id: string;
  slug: string;
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  environmentId: string;
  environmentSlug: string;
  environmentName: string | null;
  isProduction: boolean;
};

export const route = factory
  .createApp()
  // POST /api/v1/getparams.execute endpoint is used by the ArgoCD ApplicationSet to generate the parameters for each environment
  // https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Plugin/
  .post(
    '/api/v1/getparams.execute',
    bearerAuth({
      // The token is configured in terraform/argocd-environment-generator.yaml, the values is referring to the "environment-generator.token" key in the "argocd-extra-secret" secret.
      token: platformEnvVariables.ARGOCD_ENVIRONMENT_GENERATOR_TOKEN,
    }),
    async (c) => {
      const host = c.req.header('host');
      if (
        import.meta.env.MODE === 'production' &&
        host !== 'platform.platform.svc.cluster.local'
      ) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const { publicJWK } = await getKeyPair();
      const publicKey = JSON.stringify(publicJWK);

      const environments = await db
        .select()
        .from(environmentTable)
        .innerJoin(
          organizationTable,
          eq(environmentTable.organization_id, organizationTable.id),
        );

      const parameters: Values[] = await Promise.all(
        environments.map(async ({ organization, environment }) => {
          const anonKey = await signJwt({
            role: 'anon',
            aud: [organization.slug],
          });
          const runnerKey = await signJwt({
            role: 'runner',
            orgId: organization.id,
            orgSlug: organization.slug,
            envId: environment.id,
            envSlug: environment.slug,
          });
          const serviceKey = await signJwt({
            role: 'service_role',
            aud: [organization.slug],
          });
          const baseHostname = `${organization.slug}-${environment.slug}.${BASE_DOMAIN}`;
          const values = {
            id: `${organization.id}-${environment.id}`,
            slug: `${organization.slug}-${environment.slug}`,
            organizationId: organization.id,
            organizationSlug: organization.slug,
            organizationName: organization.name,
            environmentId: environment.id,
            environmentSlug: environment.slug,
            environmentName: environment.name,
            isProduction: environment.is_production,
            baseDomain: BASE_DOMAIN,
            jwt: {
              publicKey,
              anonKey,
              serviceKey,
            },
            runner: {
              httproute: {
                hostnames: [baseHostname],
              },
              environment: {
                IS_PRODUCTION: environment.is_production.toString(),
                VITE_PLATFORM_URL: platformEnvVariables.VITE_APP_URL,
                PUBLIC_KEY: publicKey,
                ANON_KEY: anonKey,
                RUNNER_KEY: runnerKey,
                ORGANIZATION_ID: organization.id,
                ORGANIZATION_SLUG: organization.slug,
                ENVIRONMENT_ID: environment.id,
                ENVIRONMENT_SLUG: environment.slug,
              },
            },
            postgrest: {
              httproute: {
                hostnames: [`postgrest.${baseHostname}`],
              },
              environment: {
                PGRST_JWT_SECRET: publicKey,
                PGRST_JWT_AUD: organization.slug,
              },
            },
            'supabase-meta': {
              httproute: {
                hostnames: [`supabase-meta.${baseHostname}`],
              },
            },
            'supabase-storage': {
              httproute: {
                hostnames: [`supabase-storage.${baseHostname}`],
              },
              environment: {
                PGRST_JWT_SECRET: publicKey,
              },
            },
            'supabase-studio': {
              httproute: {
                hostnames: [`supabase.${baseHostname}`],
              },
              environment: {
                SUPABASE_PUBLIC_URL: `http://supabase.${baseHostname}`,
                NEXT_PUBLIC_STUDIO_URL: `http://supabase.${baseHostname}`,
                SUPABASE_URL: `http://supabase.${baseHostname}`,
                SUPABASE_ANON_KEY: anonKey,
                SUPABASE_SERVICE_KEY: serviceKey,
                DEFAULT_PROJECT_NAME: organization.name,
              },
            },
            'drizzle-gateway': {
              httproute: {
                hostnames: [`drizzle.${baseHostname}`],
              },
            },
          };
          return values;
        }),
      );

      // https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Plugin/#http-server
      return c.json({
        output: {
          parameters,
        },
      });
    },
  )
  .use(auth({ requireActiveOrganization: true }))
  .get('/:environmentSlug', async (c) => {
    const { activeOrganizationId } = c.get('session');
    const { environmentSlug } = c.req.param();
    const [environment] = await db
      .select()
      .from(environmentTable)
      .where(
        and(
          eq(environmentTable.slug, environmentSlug),
          eq(environmentTable.organization_id, activeOrganizationId),
        ),
      )
      .limit(1);
    if (!environment) {
      return c.json({ error: 'Environment not found' }, 404);
    }
    const cnpgStatus = await getCnpgStatus(
      `org-${environment.organization_id}-${environment.id}`,
    );
    return c.json({
      ...environment,
      cnpgStatus,
    });
  })
  .get(
    '/',
    auth(),
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
  .post('/', zValidator('json', createEnvironmentSchema), async (c) => {
    const { activeOrganizationId } = c.get('session');
    const body = c.req.valid('json');
    const [created] = await db
      .insert(environmentTable)
      .values({
        organization_id: activeOrganizationId,
        ...body,
      })
      .returning();
    return c.json(created);
  });
