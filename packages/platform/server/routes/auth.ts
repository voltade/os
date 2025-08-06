import { cors } from 'hono/cors';

import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { auth, authMiddleware } from '#server/lib/auth.ts';

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
  .use(authMiddleware())
  .on(['POST', 'GET'], '/*', (c) => {
    return auth.handler(c.req.raw);
  });
