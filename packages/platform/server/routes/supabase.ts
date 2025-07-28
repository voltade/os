import { proxy } from 'hono/proxy';

import { factory } from '#server/factory.ts';

export const route = factory.createApp();

route.basePath('/pg').use(async (c) => {
  return proxy(`http://supabase-meta`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

route.basePath('/rest/v1').use(async (c) => {
  return proxy(`http://supabase-rest`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});

route.basePath('/storage/v1').use(async (c) => {
  return proxy(`http://supabase-storage`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      'X-Forwarded-Host': c.req.header('host'),
    },
  });
});
