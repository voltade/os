export async function slots(
  type: `slots${string}`,
  data: any,
  method: string,
  orgSlug: string,
  isAdmin: boolean,
) {
  if (type === 'slots') {
    const res = await fetch('http://drizzle-gateway:4983', {
      method,
      body: JSON.stringify({
        type: 'slots',
        data,
      }),
    });
    const result = await res.json();

    const databases = result.data.filter((database: any) =>
      database.id.startsWith(`org-${orgSlug}-`),
    );

    return {
      data: databases,
    };
  }

  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  const res = await fetch('http://drizzle-gateway:4983', {
    method,
    body: JSON.stringify({
      type,
      data,
    }),
  });
  const result = await res.json();

  return result;
}
