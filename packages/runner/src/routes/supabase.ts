import { proxy } from 'hono/proxy';

import { factory } from '#runner/factory.ts';

export const routes = factory.createApp();

routes.basePath('/pg').use(async (c) => {
  return proxy(`http://${c.env.CHART_NAME}-meta`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

routes.basePath('/rest/v1').use(async (c) => {
  return proxy(`http://${c.env.CHART_NAME}-rest`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

routes.basePath('/storage/v1').use(async (c) => {
  return proxy(`http://${c.env.CHART_NAME}-storage`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});
