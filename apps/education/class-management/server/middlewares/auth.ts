import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

import { appEnvVariables } from '#server/env.ts';

export type AuthVariables = {
  user?: {
    id: string;
    roles: Record<string, string>;
    aud: string[];
  };
};

export const auth = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    try {
      // Extract JWT from Authorization header
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json(
          { error: 'Missing or invalid Authorization header' },
          401,
        );
      }

      const token = authHeader.slice(7); // Remove 'Bearer ' prefix

      // Verify JWT with JWKS
      const { payload } = await jwtVerify<{
        sub: string;
        roles: Record<string, string>;
        aud: string[];
      }>(token, new TextEncoder().encode(appEnvVariables.PUBLIC_KEY));

      // Extract user information from JWT payload
      const user = {
        id: payload.sub,
        roles: payload.roles,
        aud: payload.aud,
      };

      // Set user in context
      c.set('user', user);

      return next();
    } catch (error) {
      console.error('JWT verification failed:', error);
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
  },
);
