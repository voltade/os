import { env } from '@voltade/sdk/server';

interface PlatformRequestOptions<T = unknown> {
  url: string; // endpoint path after /api
  body?: T;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export const platformClient = async <
  TResponse = unknown,
  TBody extends object = {},
>(
  options: PlatformRequestOptions<TBody>,
): Promise<TResponse> => {
  const { url, body, method = 'POST' } = options;

  // Always merge in organizationId from env
  const finalBody = {
    ...(body || {}),
    organizationId: env.ORGANIZATION_ID,
  };

  const res = await fetch(`${env.PLATFORM_URL}${url}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.RUNNER_KEY}`,
    },
    body: method === 'GET' ? undefined : JSON.stringify(finalBody),
  });

  if (!res.ok) {
    throw new Error(
      `Platform request failed (${res.status}): ${await res.text()}`,
    );
  }

  return (await res.json()) as TResponse;
};
