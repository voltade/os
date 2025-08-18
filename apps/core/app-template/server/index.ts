import { createCommonRouter } from '@voltade/core-schema/common-api';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';

import { db } from '#server/lib/db.ts';
import runtimeRoute from '#server/routes/runtime.ts';
import { route as educationRoute } from './routes/education/index.ts';
import { route as productRoute } from './routes/product/index.ts';

const API_BASE_ROUTE = '/api';

const app = new Hono();
app.use(logger());

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok' });
});

// NOTE: Since most apps operate within a specialized domain, there is no need
// for most apps to split the backend routes by schema as shown here.
// e.g. /api/education/register-student vs. /api/register-student
export const apiRoutes = app
  .basePath(API_BASE_ROUTE)
  .route('/runtime.js', runtimeRoute)
  .route('/product', productRoute) //DEMO purposes, should be using common one
  .route('/education', educationRoute)
  .route('/common', createCommonRouter(db));
// TODO: Add more API routes here

export type ApiRoutes = typeof apiRoutes;

app
  .get('/*', serveStatic({ root: `${import.meta.dir}/static` }))
  .get('/*', serveStatic({ path: `${import.meta.dir}/static/index.html` }));

if (Bun.isMainThread) {
  Bun.serve({
    port: 30000,
    fetch: app.fetch,
  });
} else {
  Bun.serve({
    unix: `${import.meta.dir}/server.sock`,
    fetch: app.fetch,
  });
}
