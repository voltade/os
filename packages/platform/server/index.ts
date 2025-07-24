import { serveStatic } from 'hono/bun';

import { factory } from '#server/factory.ts';
import { route as environmentRoute } from '#server/routes/environment.ts';
import { route as envVarsRoute } from '#server/routes/envVars.ts';
import { route as kratosRoute } from '#server/routes/kratos.ts';

const app = factory.createApp();

app.get('/', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

export const apiRoutes = app
  .basePath('/api')
  .route('/environment', environmentRoute)
  .route('/envVars', envVarsRoute)
  .route('/kratos', kratosRoute);

app
  .get('/*', serveStatic({ root: './dist/static' }))
  .get('/*', serveStatic({ path: './dist/static/index.html' }));

export default app;
