import { symmetricDecrypt } from 'better-auth/crypto';
import { desc, eq } from 'drizzle-orm';
import * as jose from 'jose';

import {
  jwks as jwksTable,
  organization as organizationTable,
} from '#drizzle/auth.ts';
import { environmentTable } from '#drizzle/environment';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { signJwt } from '#server/lib/jwk.ts';

type Common = {
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
    // const reqBody = await c.req.json();
    console.log(c.req.method, c.req.url);
    const results = await db
      .select()
      .from(environmentTable)
      .innerJoin(
        organizationTable,
        eq(environmentTable.organization_id, organizationTable.id),
      );

    // Pass the latest two JWKs to the PostgREST to be used as the JWT_SECRET config: https://docs.postgrest.org/en/v13/references/auth.html#asym-keys
    const jwks = await db
      .select()
      .from(jwksTable)
      .orderBy(desc(jwksTable.createdAt))
      .limit(2);
    const publicWebKeySet: jose.JSONWebKeySet = {
      keys: jwks.map(({ publicKey }) => JSON.parse(publicKey)),
    };
    const publicKey = JSON.stringify(publicWebKeySet);

    // Decrypt the private key to be used for signing long-live anon and service_role tokens
    const decryptedPrivateKey = await symmetricDecrypt({
      key: appEnvVariables.AUTH_SECRET,
      data: jwks[0].privateKey,
    });
    const privateWebKey = JSON.parse(
      decryptedPrivateKey,
    ) as jose.JWK_RSA_Private;
    if (!privateWebKey.alg) {
      throw new Error('Private key must have an algorithm specified');
    }
    const privateKey = await jose.importJWK(privateWebKey, privateWebKey.alg);

    const parameters: Parameters[] = await Promise.all(
      results.map(async ({ organization, environment }) => {
        const common: Common = {
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
            environmentChartVersion: '0.1.40',
            isProduction: environment.is_production,
          },
          values: {
            global: {
              ...common,
              publicKey,
              anonKey: await signJwt(
                privateWebKey.alg as string,
                privateKey,
                'anon',
                [organization.id],
              ),
              serviceKey: await signJwt(
                privateWebKey.alg as string,
                privateKey,
                'service_role',
                [organization.id],
              ),
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
  });
