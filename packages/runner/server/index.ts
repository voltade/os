import { factory } from '#server/factory.ts';
import { routes as appsRoutes } from '#server/routes/apps.ts';
import { routes as supabaseRoutes } from '#server/routes/supabase.ts';

const app = factory.createApp();

app.get('/healthz', (c) =>
  c.json({ message: 'ok', timestamp: new Date().toISOString() }),
);

export const apiRoutes = app
  .route('/apps', appsRoutes)
  .route('/', supabaseRoutes);

export default {
  port: 3001,
  fetch: app.fetch,
};
