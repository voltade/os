import { proxy } from 'hono/proxy';

import { factory } from '#server/factory.ts';
import { canAccessDrizzle } from '#server/middleware/auth.ts';

const DRIZZLE_GATEWAY_URL = 'http://drizzle-gateway:4983';

export const routes = factory
  .createApp()
  .use(canAccessDrizzle)
  .use(async (c) => {
    const url = new URL(c.req.url);
    const fullPath = url.href.replace(`${url.origin}/drizzle`, '');

    const contentType = c.req.raw.headers.get('content-type');
    if (!contentType || contentType !== 'application/json') {
      const url = new URL(c.req.url);
      const fullPath = url.href.replace(`${url.origin}/drizzle`, '');
      const response = await proxy(`${DRIZZLE_GATEWAY_URL}${fullPath}`, {
        ...c.req,
        headers: {
          ...c.req.header(),
          host: new URL(DRIZZLE_GATEWAY_URL).host,
        },
      });

      // Check if response is HTML and modify it
      const responseContentType = response.headers.get('content-type');
      if (responseContentType?.includes('text/html')) {
        const html = await response.text();
        const modifiedHtml = html
          .replace(/src="\/index\.js"/g, 'src="/drizzle/index.js"')
          .replace(/href="\/index\.css"/g, 'href="/drizzle/index.css"')
          .replace(/src="\/favicon.svg"/g, 'src="/drizzle/favicon.svg"');

        return new Response(modifiedHtml, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return response;
    }

    return proxy(`${DRIZZLE_GATEWAY_URL}${fullPath}`, {
      ...c.req,
      headers: {
        ...c.req.header(),
        host: 'drizzle',
      },
    });
  });
