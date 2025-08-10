import { appEnvVariables } from '#server/env.ts';

export async function slots({
  type,
  data,
  method,
  isAdmin,
  orgId,
}: {
  type: `slots${string}`;
  data: any;
  method: string;
  orgId?: string;
  isAdmin: boolean;
}) {
  if (!isAdmin && !orgId) {
    return {
      data: [],
    };
  }
  if (type === 'slots') {
    const res = await fetch(appEnvVariables.DRIZZLE_GATEWAY_URL, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'slots',
      }),
    });
    const result = await res.json();

    console.log(JSON.stringify(result, null, 2));

    const databases = result.data.filter((database: any) =>
      database.id.startsWith(`org-`),
    );

    return {
      data: databases,
    };
  }

  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  const res = await fetch(appEnvVariables.DRIZZLE_GATEWAY_URL, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type,
      data,
    }),
  });
  const result = await res.json();

  return result;
}
