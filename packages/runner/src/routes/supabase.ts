import { proxy } from 'hono/proxy';

import { factory } from '#runner/factory.ts';

export const routes = factory.createApp();

routes.basePath('/pg').use(async (c) => {
  return proxy(`http://supabase-meta:8080`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

routes.basePath('/rest/v1').use(async (c) => {
  return proxy(`http://postgrest:3000`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

routes.basePath('/storage/v1').use(async (c) => {
  return proxy(`http://supabase-storage:5000`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

routes.all('*').use(async (c) => {
  return proxy(`http://supabase-studio:3000`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});
