import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';

import runtimeRoute from '#server/routes/runtime.ts';
import { route as createClassRoute } from './routes/create-class.ts';
import { route as getClassesRoute } from './routes/get-classes.ts';

const API_BASE_ROUTE = '/api';

const app = new Hono();
app.use(logger());

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok' });
});

export const apiRoutes = app
  .basePath(API_BASE_ROUTE)
  .route('/runtime.js', runtimeRoute)
  .route('/create-class', createClassRoute)
  .route('/get-classes', getClassesRoute);

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
