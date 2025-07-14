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
                instance_id: 'prod',
                instance_chart_version: '0.1.3',
                instance_fullname: 'voltade--prod',
                environment: 'production',
              },
            ],
          },
        });
      },
    },
  },
});
