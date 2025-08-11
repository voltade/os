import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { routes as appsRoutes } from '#server/routes/apps.ts';
import { routes as supabaseRoutes } from '#server/routes/supabase.ts';
import { getCnpgSecret } from './utils/k8s.ts';

// Startup API call to drizzle-proxy
async function initializeDrizzleConnection() {
  try {
    const namespace = `org-${appEnvVariables.ORGANIZATION_ID}-${appEnvVariables.ENVIRONMENT_ID}`;
    const { username, password } = await getCnpgSecret(namespace);
    const response = await fetch(`${appEnvVariables.PLATFORM_URL}/drizzle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appEnvVariables.PROXY_SECRET_TOKEN}`,
      },
      body: JSON.stringify({
        type: 'slots:sync',
        data: {
          slot: {
            id: namespace,
            name: appEnvVariables.ENVIRONMENT_ID,
            dialect: 'postgresql',
            credentials: {
              url: `postgres://${username}:${password}@cnpg-cluster-rw.${namespace}:5432/app`,
            },
          },
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Drizzle proxy initialized successfully:', result);
    } else {
      console.error(
        'Failed to initialize drizzle proxy:',
        response.status,
        response.statusText,
      );
    }
  } catch (error) {
    console.error('Error connecting to drizzle proxy:', error);
  }
}

// Initialize drizzle connection on startup
initializeDrizzleConnection();

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
