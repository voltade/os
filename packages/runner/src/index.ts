import { factory } from '#runner/factory.ts';
import { routes as appsRoutes } from '#runner/routes/apps.ts';
import { routes as supabaseRoutes } from '#runner/routes/supabase.ts';

const app = factory.createApp();

app.get('/healthz', (c) =>
  c.json({ message: 'ok', timestamp: new Date().toISOString() }),
);

export const apiRoutes = app
  .route('/apps', appsRoutes)
  .route('/', supabaseRoutes);

export default app;
