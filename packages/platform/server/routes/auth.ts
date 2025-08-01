import { cors } from 'hono/cors';

import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { auth } from '#server/lib/auth.ts';

export const route = factory
  .createApp()
  // https://www.better-auth.com/docs/integrations/hono#cors
  .use(
    cors({
      origin: appEnvVariables.VITE_APP_URL, // replace with your origin
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['POST', 'GET', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  )
  // https://www.better-auth.com/docs/integrations/hono#middleware
  .use(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set('user', null);
      c.set('session', null);
      return next();
    }
    c.set('user', session.user);
    c.set('session', session.session);
    return next();
  })
  .on(['POST', 'GET'], '/*', (c) => {
    return auth.handler(c.req.raw);
  });
