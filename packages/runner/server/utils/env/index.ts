import { BASE_DOMAIN, PROTOCOL } from '#server/const.ts';
import { appEnvVariables } from '#server/zod/env.ts';

export async function getAppEnvs(
  ORGANIZATION_ID: string,
  ENVIRONMENT_ID: string,
): Promise<Record<string, string>> {
  const res = await fetch(
    `${appEnvVariables.PLATFORM_URL}/api/environment_variable/${ORGANIZATION_ID}/${ENVIRONMENT_ID}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appEnvVariables.RUNNER_KEY}`,
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

export function getPgrestUrl({
  orgSlug,
  envSlug,
}: {
  orgSlug: string;
  envSlug: string;
}) {
  const url = `${PROTOCOL}//postgrest.${orgSlug}-${envSlug}.${BASE_DOMAIN}`;
  return url;
}
