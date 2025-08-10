import { proxy } from 'hono/proxy';

import { factory } from '#server/factory.ts';
import { slots } from '#server/utils/slots.ts';

export const route = factory.createApp().use('/', async (c) => {
  const contentType = c.req.raw.headers.get('content-type');

  if (!!contentType && contentType !== 'application/json') {
    return proxy('http://drizzle-gateway:4983', c.req);
  }

  const body = await c.req.json();

  if (body.type.startsWith('slots')) {
    const auth = c.req.raw.headers.get('Authorization');
    try {
      const result = await slots(
        body.type,
        body.data,
        c.req.method,
        body.data.orgSlug,
        auth !== `Bearer ${c.env.PROXY_SECRET_TOKEN}`,
      );
      return c.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 401);
      }
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }

  return c.json({ error: 'Invalid request' }, 400);
});
