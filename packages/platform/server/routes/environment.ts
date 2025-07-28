import { environmentTable } from '#drizzle/environment';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

interface Environment {
  org_id: string;
  is_production: boolean;
  environment_id: string;
  environment_chart_version: string;
  service_key: string;
  anon_key: string;
}

export const route = factory
  .createApp()
  .post('/api/v1/getparams.execute', async (c) => {
    // const reqBody = await c.req.json();
    console.log(c.req.method, c.req.url);
    const environments = await db.select().from(environmentTable);
    return c.json({
      output: {
        parameters: environments.map((environment) => ({
          org_id: environment.org_id,
          is_production: environment.is_production,
          environment_id: environment.id,
          environment_chart_version: '0.1.5',
          service_key: environment.service_key,
          anon_key: environment.anon_key,
        })) satisfies Environment[],
      },
    });
  });
