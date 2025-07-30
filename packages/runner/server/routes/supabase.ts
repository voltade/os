import { proxy } from 'hono/proxy';

import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';

export const routes = factory.createApp();

const {
  POSTGREST_URL,
  SUPABASE_META_URL,
  SUPABASE_STORAGE_URL,
  SUPABASE_STUDIO_URL,
} = appEnvVariables;
const POSTGREST_HOST = new URL(POSTGREST_URL).host;
const SUPABASE_META_HOST = new URL(SUPABASE_META_URL).host;
const SUPABASE_STORAGE_HOST = new URL(SUPABASE_STORAGE_URL).host;
const SUPABASE_STUDIO_HOST = new URL(SUPABASE_STUDIO_URL).host;

routes.basePath('/rest/v1').use(async (c) => {
  const url = new URL(c.req.url);
  const fullPath = url.href.replace(`${url.origin}/rest/v1`, '');
  return proxy(`${POSTGREST_URL}${fullPath}`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      host: POSTGREST_HOST,
    },
  });
});

routes.basePath('/pg').use(async (c) => {
  const url = new URL(c.req.url);
  const fullPath = url.href.replace(`${url.origin}/pg`, '');
  return proxy(`${SUPABASE_META_URL}${fullPath}`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      host: SUPABASE_META_HOST,
    },
  });
});

routes.basePath('/storage/v1').use(async (c) => {
  const url = new URL(c.req.url);
  const fullPath = url.href.replace(`${url.origin}/storage/v1`, '');
  return proxy(`${SUPABASE_STORAGE_URL}${fullPath}`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      host: SUPABASE_STORAGE_HOST,
    },
  });
});

routes
  .get('/api/v1/projects/default/branches', (c) => {
    return c.json([]);
  })
  .get('/api/v1/projects/default/api-keys', (c) => {
    return c.json([]);
  });

routes.use(async (c) => {
  const url = new URL(c.req.url, SUPABASE_STUDIO_URL);
  if (url.pathname === '/') {
    return c.redirect('/project/default');
  }

  const fullPath = url.href.replace(url.origin, '');
  return proxy(`${SUPABASE_STUDIO_URL}${fullPath}`, {
    ...c.req,
    headers: {
      ...c.req.header(),
      host: SUPABASE_STUDIO_HOST,
    },
  });
});
