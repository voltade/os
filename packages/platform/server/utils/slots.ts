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

    const databases = result.data.filter((database: any) =>
      database.id.startsWith(`org-`),
    );

    return {
      data: databases,
      success: true,
    };
  }

  if (type === 'slots:get') {
    const res = await fetch(appEnvVariables.DRIZZLE_GATEWAY_URL, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'slots:get',
        data: data,
      }),
    });
    const result = await res.json();
    return {
      data: result.data,
      success: true,
    };
  }

  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  console.log(
    JSON.stringify(
      {
        type,
        data,
      },
      null,
      2,
    ),
  );

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
