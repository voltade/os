import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { routes as appsRoutes } from '#server/routes/apps.ts';
import { routes as drizzleRoutes } from '#server/routes/drizzle.ts';
import { routes as supabaseRoutes } from '#server/routes/supabase.ts';

export const appInstallations = new Map<string, string>();

async function initAppInstallations() {
  const res = await fetch(
    `${appEnvVariables.PLATFORM_URL}/api/app_installation/runner?organizationSlug=${appEnvVariables.ORGANIZATION_SLUG}&environmentSlug=${appEnvVariables.ENVIRONMENT_SLUG}`,
    {
      headers: {
        Authorization: `Bearer ${appEnvVariables.RUNNER_KEY}`,
      },
    },
  );

  console.log(res);

  const data = await res.json();

  console.log(data);

  for (const app of data) {
    appInstallations.set(app.app.slug, app.app_installation.app_build_id);
  }
}

await initAppInstallations();

const app = factory.createApp();

app.get('/healthz', (c) =>
  c.json({ message: 'ok', timestamp: new Date().toISOString() }),
);

export const apiRoutes = app
  // .use(isAuthenticated)
  .route('/apps', appsRoutes)
  .route('/drizzle', drizzleRoutes)
  .route('/', supabaseRoutes);

export default {
  port: 3001,
  fetch: app.fetch,
};
