import { serveStatic } from 'hono/bun';

import { factory } from '#server/factory.ts';
import { route as environmentRoute } from '#server/routes/environment.ts';
import { route as environmentVariableRoute } from '#server/routes/environment_variable.ts';
import { route as kratosRoute } from '#server/routes/kratos.ts';
import { auth } from './lib/auth.ts';

const app = factory.createApp();

app.get('/', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

// https://www.better-auth.com/docs/integrations/hono#middleware
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }
  c.set('user', session.user);
  c.set('session', session.session);
  return next();
});

export const apiRoutes = app
  .basePath('/api')
  // https://www.better-auth.com/docs/integrations/hono#mount-the-handler
  .on(['POST', 'GET'], '/auth/*', (c) => {
    return auth.handler(c.req.raw);
  })
  .route('/environment', environmentRoute)
  .route('/environment_variable', environmentVariableRoute)
  .route('/kratos', kratosRoute);

app
  .get('/*', serveStatic({ root: './dist/static' }))
  .get('/*', serveStatic({ path: './dist/static/index.html' }));

export default app;
