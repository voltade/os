import { environments } from '#server/drizzle/environments.ts';
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
    const reqBody = await c.req.json();
    console.log(c.req.method, c.req.url, reqBody);

    try {
      const envs = await db.select().from(environments);
      return c.json({
        output: {
          parameters: envs.map((env) => ({
            org_id: env.orgId,
            is_production: env.production,
            environment_id: env.id,
            environment_chart_version: '0.1.5',
            service_key: env.serviceKey,
            anon_key: env.anonKey,
          })) satisfies Environment[],
        },
      });
    } catch (error) {
      console.error(error);
      return c.json({
        output: {
          parameters: [
            {
              org_id: 'voltade',
              is_production: true,
              environment_id: '90a8834',
              environment_chart_version: '0.1.5',
              service_key:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
              anon_key:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
            },
          ],
        },
      });
    }
  });
