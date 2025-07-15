Bun.serve({
  port: 3000,
  routes: {
    '/api/v1/getparams.execute': {
      POST: async (req) => {
        const reqBody = await req.json();
        console.log(req.method, req.url, reqBody);
        return Response.json({
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
      },
    },
  },
});
