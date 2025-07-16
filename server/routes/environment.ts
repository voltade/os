import { factory } from '#server/factory.ts';

export const route = factory
  .createApp()
  .post('/api/v1/getparams.execute', async (c) => {
    const reqBody = await c.req.json();
    console.log(c.req.method, c.req.url, reqBody);
    return c.json({
      output: {
        parameters: [
          {
            org_id: 'voltade',
            is_production: true,
            environment_id: '90a8834',
            environment_chart_version: '0.1.0',
          },
          {
            org_id: 'voltade',
            is_production: false,
            environment_id: 'd9390b2',
            environment_chart_version: '0.1.0',
          },
        ],
      },
    });
  });
