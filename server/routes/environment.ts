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
            environment_id: '90a8837',
            environment_chart_version: '0.1.2',
            service_key:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NTI4MDUyMTcsImV4cCI6MjA2ODE2NTIxN30.eZnX2_UmqGoxQfAzTesxrYQJmUgmwgwCR7roySZDcHI',
            anon_key:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUyODA1MjE3LCJleHAiOjIwNjgxNjUyMTd9.z8Ot0a3-jNuzN9BMz6_kiC9OYmsynENPQowcykY75mk',
          },
        ],
      },
    });
  });
