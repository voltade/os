import { serveStatic } from 'hono/bun';

import { factory } from '#server/factory.ts';
import { route as appInstallationRoute } from '#server/routes/app_installation.ts';
import { route as appsRoute } from '#server/routes/apps.ts';
import { route as authRoute } from '#server/routes/auth.ts';
import { route as environmentRoute } from '#server/routes/environment.ts';
import { route as environmentVariableRoute } from '#server/routes/environment_variable.ts';

const app = factory.createApp();

app.get('/', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

export const apiRoutes = app
  .basePath('/api')
  .route('/auth', authRoute)
  .route('/environment', environmentRoute)
  .route('/environment_variable', environmentVariableRoute)
  .route('/apps', appsRoute)
  .route('/app_installation', appInstallationRoute);

app
  .get('/*', serveStatic({ root: './dist/static' }))
  .get('/*', serveStatic({ path: './dist/static/index.html' }));

export default app;

export type AppType = typeof apiRoutes;
