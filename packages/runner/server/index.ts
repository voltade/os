import { factory } from '#server/factory.ts';
import { routes as appsRoutes } from '#server/routes/apps.ts';
import { routes as drizzleRoutes } from '#server/routes/drizzle.ts';
import { routes as supabaseRoutes } from '#server/routes/supabase.ts';
import { isAuthenticated } from './middleware/auth.ts';

const app = factory.createApp();

app.get('/healthz', (c) =>
  c.json({ message: 'ok', timestamp: new Date().toISOString() }),
);

export const apiRoutes = app
  .use(isAuthenticated)
  .route('/apps', appsRoutes)
  .route('/drizzle', drizzleRoutes)
  .route('/', supabaseRoutes);

export default {
  port: 3001,
  fetch: app.fetch,
};
