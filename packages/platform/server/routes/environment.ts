import { environmentTable } from '#drizzle/environment';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { anonJwt, privateKey, publicKey, serviceJwt } from '#server/lib/jwk.ts';

type Variables = {
  orgId: string;
  environmentId: string;
  environmentChartVersion: string;
  isProduction: boolean;
};

type Values = Record<string, unknown> & {
  anon_key: string;
  service_key: string;
  postgrest: {
    environment: {
      PGRST_JWT_SECRET: string;
      PGRST_JWT_AUD: string;
    };
  };
  deployment: {
    environment: {
      ORG_ID: string;
    };
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
    const environments = await db.select().from(environmentTable);

    const parameters: Parameters[] = await Promise.all(
      environments.map(async (environment) => ({
        variables: {
          orgId: environment.org_id,
          environmentId: environment.id,
          environmentChartVersion: '0.1.8',
          isProduction: environment.is_production,
        },
        values: {
          anon_key: await anonJwt
            .setAudience([environment.org_id])
            .sign(privateKey),
          service_key: await serviceJwt
            .setAudience([environment.org_id])
            .sign(privateKey),
          postgrest: {
            environment: {
              PGRST_JWT_SECRET: publicKey,
              // https://docs.postgrest.org/en/v13/references/auth.html#jwt-aud-validation
              PGRST_JWT_AUD: environment.org_id,
            },
          },
          deployment: {
            environment: {
              ORG_ID: environment.org_id,
            },
          },
        },
      })),
    );

    // https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators-Plugin/#http-server
    return c.json({
      output: {
        parameters,
      },
    });
  });
