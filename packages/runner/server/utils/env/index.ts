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
