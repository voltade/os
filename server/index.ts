import { factory } from '#server/factory.ts';
import { routes as argocdRoutes } from '#server/routes/argocd.ts';
import { serveStatic } from 'hono/bun';

const app = factory.createApp();

app.get('/', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

app.get('/healthz', (c) => {
  return c.json({ message: 'Ok', time: new Date().toISOString() });
});

export const apiRoutes = app.basePath('/api').route('/v1/getparams.execute', argocdRoutes);

app
  .get('/*', serveStatic({ root: './dist/static' }))
  .get('/*', serveStatic({ path: './dist/static/index.html' }));
  
export default app;
