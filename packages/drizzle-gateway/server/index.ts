import { factory } from '#server/factory.ts';
import { route as proxyRoutes } from '#server/routes/proxy.ts';

const app = factory.createApp();

app.get('/healthz', (c) =>
  c.json({ message: 'ok', timestamp: new Date().toISOString() }),
);

export const apiRoutes = app.route('/', proxyRoutes);

export default {
  port: 3001,
  fetch: app.fetch,
};
