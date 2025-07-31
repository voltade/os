import { eq } from 'drizzle-orm';

import { environmentTable } from '#drizzle/environment';
import { orgTable } from '#drizzle/org.ts';
import { factory } from '#server/factory.ts';
import { auth } from '#server/lib/auth.ts';
import { db } from '#server/lib/db.ts';
import { anonJwt, privateKey, serviceJwt } from '#server/lib/jwk.ts';

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
    const results = await db
      .select()
      .from(environmentTable)
      .innerJoin(orgTable, eq(environmentTable.org_id, orgTable.id));

    const jwks = auth.api.getJwks();

    const parameters: Parameters[] = await Promise.all(
      results.map(async ({ environment, org }) => ({
        variables: {
          orgId: org.id,
          environmentId: environment.id,
          environmentChartVersion: '0.1.39',
          releaseName: `${environment.org_id}-${environment.id}`,
          isProduction: environment.is_production,
        },
        values: {
          global: {
            orgId: org.id,
            orgName: org.display_name,
            environmentId: environment.id,
            publicKey: JSON.stringify(jwks),
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
