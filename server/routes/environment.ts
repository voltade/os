import { environments } from '#server/drizzle/environments.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory
  .createApp()
  .post('/api/v1/getparams.execute', async (c) => {
    const reqBody = await c.req.json();
    console.log(c.req.method, c.req.url, reqBody);
    const envs = await db.select().from(environments);

    return c.json({
      output: {
        parameters: envs.map((env) => ({
          org_id: env.orgId,
          is_production: env.production,
          environment_id: env.id,
          environment_chart_version: '0.1.4',
          service_key: env.serviceKey,
          anon_key: env.anonKey,
        })),
      },
    });
  });
