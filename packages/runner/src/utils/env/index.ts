export async function getAppEnvs(
  orgId: string,
  appId: string,
  OS_URL: string,
): Promise<Record<string, string>> {
  const res = await fetch(`${OS_URL}/api/env/`, {
    method: 'POST',
    body: JSON.stringify({
      orgId,
      appId,
    }),
  });
  const data = (await res.json()) as Record<string, string>;
  return data;
}
