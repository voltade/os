import { factory } from "#server/factory.ts";

export const routes = factory.createApp().post('/v1/getparams.execute', async (c) => {
  const reqBody = await c.req.json();
  console.log(c.req.method, c.req.url, reqBody);
  return c.json({
    output: {
      parameters: [
        {
          org_id: 'voltade',
          instance_id: 'prod',
          instance_chart_version: '0.1.0',
          instance_fullname: 'voltade-prod',
          environment: 'production',
        },
      ],
    },
  });
});