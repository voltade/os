import { createRemoteJWKSet, jwtVerify } from 'jose';

import { appEnvVariables, type VoltadeJWTPayload } from '#server/env.ts';
import { factory } from '#server/factory.ts';

const JWT_COOKIE_NAME = 'voltade-jwt';

async function validateToken(token: string): Promise<VoltadeJWTPayload> {
  try {
    const JWKS = createRemoteJWKSet(
      new URL(`${appEnvVariables.PLATFORM_URL}/api/auth/jwks`),
    );
    const { payload } = await jwtVerify(token, JWKS, {
      audience: [appEnvVariables.ORGANIZATION_SLUG],
    });
    return payload as VoltadeJWTPayload;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw error;
  }
}

export const isAuthenticated = factory.createMiddleware(async (c, next) => {
  const token = c.req
    .header('cookie')
    ?.split('; ')
    .find((cookie) => cookie.startsWith(`${JWT_COOKIE_NAME}=`))
    ?.split('=')[1];
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const decoded = await validateToken(token);
  if (!decoded) return c.json({ error: 'Unauthorized' }, 401);

  await next();
});

export const canAccessDrizzle = factory.createMiddleware(async (c, next) => {
  const token = c.req
    .header('cookie')
    ?.split('; ')
    .find((cookie) => cookie.startsWith(`${JWT_COOKIE_NAME}=`))
    ?.split('=')[1];
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const decoded = await validateToken(token);
  if (!decoded) return c.json({ error: 'Unauthorized' }, 401);

  if (
    !['admin', 'owner', 'developer'].includes(
      decoded.roles[appEnvVariables.ORGANIZATION_SLUG],
    )
  ) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
