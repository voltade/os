export async function getAppEnvs(
  organizationId: string,
  appId: string,
  platformUrl: string,
): Promise<Record<string, string>> {
  const res = await fetch(`${platformUrl}/api/env/`, {
    method: 'POST',
    body: JSON.stringify({
      organizationId,
      appId,
    }),
  });
  const data = (await res.json()) as Record<string, string>;
  return data;
}
