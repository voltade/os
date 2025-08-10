import { factory } from '#server/factory.ts';

const app = factory.createApp();

app.get('/healthz', (c) =>
  c.json({ message: 'ok', timestamp: new Date().toISOString() }),
);

export const apiRoutes = app;

export default {
  port: 3001,
  fetch: app.fetch,
};
