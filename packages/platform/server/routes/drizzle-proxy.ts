import { proxy } from 'hono/proxy';

import { factory } from '#server/factory.ts';
import { authMiddleware } from '#server/lib/auth/index.ts';
import { slots } from '#server/utils/slots.ts';

export const route = factory
  .createApp()
  .use(authMiddleware(true))
  .use(async (c) => {
    const contentType = c.req.raw.headers.get('content-type');
    if (!contentType || contentType !== 'application/json') {
      const url = new URL(c.req.url);
      const fullPath = url.href.replace(`${url.origin}/drizzle`, '');
      const response = await proxy(`${c.env.DRIZZLE_GATEWAY_URL}${fullPath}`, {
        ...c.req,
        headers: {
          ...c.req.header(),
          host: new URL(c.env.DRIZZLE_GATEWAY_URL).host,
        },
      });

      // Check if response is HTML and modify it
      const responseContentType = response.headers.get('content-type');
      if (responseContentType?.includes('text/html')) {
        const html = await response.text();
        const modifiedHtml = html
          .replace(/src="\/index\.js"/g, 'src="/drizzle/index.js"')
          .replace(/href="\/index\.css"/g, 'href="/drizzle/index.css"');

        return new Response(modifiedHtml, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return response;
    }

    const body = await c.req.json();

    // biome-ignore lint/style/noNonNullAssertion: This is guaranteed by the auth middleware
    const session = c.get('session')!;

    if (body.type.startsWith('slots')) {
      const auth = c.req.raw.headers.get('Authorization');
      try {
        const result = await slots({
          type: body.type,
          data: body.data,
          method: c.req.method,
          orgId: session?.activeOrganizationId ?? undefined,
          isAdmin: auth?.replace('Bearer ', '') === c.env.PROXY_SECRET_TOKEN,
        });
        return c.json(result);
      } catch (error) {
        if (error instanceof Error) {
          return c.json({ error: error.message }, 401);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
      }
    }

    if (body.type === 'init') {
      return c.json({
        success: true,
        data: {
          id: session.userId,
          isMaster: false,
          isVolumeSet: true,
          version: '1.0.1',
          volume: './app',
        },
      });
    }

    if (
      body.type === 'proxy' &&
      !body.data.slotId.startsWith(
        `org-${session?.activeOrganizationId ?? 'undefined'}`,
      )
    ) {
      return c.json(
        {
          error: 'Unauthorized',
        },
        401,
      );
    }

    return proxy(c.env.DRIZZLE_GATEWAY_URL, {
      method: c.req.method,
      body: JSON.stringify(body),
      headers: {
        ...c.req.header(),
        host: new URL(c.env.DRIZZLE_GATEWAY_URL).host,
      },
    });
  });
