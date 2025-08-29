import { baseEnv } from '../env.ts';

interface PlatformRequestOptions<T = unknown> {
  url: string; // endpoint path after /api
  body?: T;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export const platformClient = async <
  TResponse = unknown,
  // biome-ignore lint/complexity/noBannedTypes: Request body can be anything required by the api
  TBody extends object = {},
>(
  options: PlatformRequestOptions<TBody>,
): Promise<TResponse> => {
  const { url, body, method = 'POST' } = options;

  // Always merge in organizationId from env
  const finalBody = {
    ...(body || {}),
    organizationId: baseEnv.ORGANIZATION_ID,
  };

  const res = await fetch(`${baseEnv.PLATFORM_URL}${url}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${baseEnv.RUNNER_KEY}`,
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
