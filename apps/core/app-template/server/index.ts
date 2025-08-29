import { createCommonRouter } from '@voltade/core-schema/common-api';
import { auth, createRunTimeRoute, db, drizzle } from '@voltade/sdk/server';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { logger } from 'hono/logger';

import { factory } from './factory.ts';

const API_BASE_ROUTE = '/api';

const app = new Hono();
app.use(logger());

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok' });
});

export const apiRoutes = app
  .basePath(API_BASE_ROUTE)
  .route('/runtime.js', createRunTimeRoute('app-template', factory))
  .use(auth)
  .use(drizzle())
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
