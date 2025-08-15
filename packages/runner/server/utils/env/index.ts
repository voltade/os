import { appEnvVariables } from '#server/env.ts';
import { getCnpgSecret, getHttpRouteHostname } from '../k8s.ts';

export async function getAppEnvs(
  ORGANIZATION_ID: string,
  ENVIRONMENT_ID: string,
  platform: {
    RUNNER_SECRET_TOKEN: string;
    platformUrl: string;
  },
): Promise<Record<string, string>> {
  const res = await fetch(
    `${platform.platformUrl}/api/environment_variable/${ORGANIZATION_ID}/${ENVIRONMENT_ID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${platform.RUNNER_SECRET_TOKEN}`,
      },
    },
  );
  if (!res.ok) {
    console.error('Failed to fetch environment variables', res.statusText);
    throw new Error('Failed to fetch environment variables');
  }
  const data = (await res.json()) as Record<string, string>;
  return data;
}

export async function getAppEnvsFromK8s() {
  const namespace = `org-${appEnvVariables.ORGANIZATION_ID}-${appEnvVariables.ENVIRONMENT_ID}`;
  const { username, password } = await getCnpgSecret(
    namespace,
    'cnpg-authenticator',
  );

  if (!username || !password) {
    throw new Error('Failed to fetch database credentials');
  }

  const pgrstHostname = await getHttpRouteHostname(namespace, 'postgrest');
  let pgrstUrl = '';
  if (pgrstHostname.endsWith('nip.io')) {
    pgrstUrl = `http://${pgrstHostname}`;
  } else {
    pgrstUrl = `https://${pgrstHostname}`;
  }

  return {
    DB_USER: username,
    DB_PASSWORD: password,
    DB_NAME: 'app',
    DB_PORT: '5432',
    DB_HOST: 'cnpg-cluster-rw',
    VITE_PGREST_URL: pgrstUrl,
  };
}
