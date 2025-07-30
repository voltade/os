import { environmentTable } from '#drizzle/environment';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { anonJwt, privateKey, publicKey, serviceJwt } from '#server/lib/jwk.ts';

type Variables = {
  orgId: string;
  environmentId: string;
  environmentChartVersion: string;
  releaseName: string;
  isProduction: boolean;
};

type Values = Record<string, unknown> & {
  global: {
    orgId: string;
    environmentId: string;
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
    const environments = await db.select().from(environmentTable);

    const parameters: Parameters[] = await Promise.all(
      environments.map(async (environment) => ({
        variables: {
          orgId: environment.org_id,
          environmentId: environment.id,
          environmentChartVersion: '0.1.19',
          releaseName: `${environment.org_id}-${environment.id}`,
          isProduction: environment.is_production,
        },
        values: {
          global: {
            orgId: environment.org_id,
            environmentId: environment.id,
            publicKey,
            anonKey: await anonJwt
              .setAudience([environment.org_id])
              .sign(privateKey),
            serviceKey: await serviceJwt
              .setAudience([environment.org_id])
              .sign(privateKey),
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
