import { createRemoteJWKSet, jwtVerify } from 'jose';

import { appEnvVariables } from '#server/env.ts';
import { factory, type Oauth2Payload } from '#server/factory.ts';

const PLATFORM_AUTH_URL = `${appEnvVariables.PLATFORM_URL}/api/auth`;

async function validateToken(token: string): Promise<Oauth2Payload> {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${PLATFORM_AUTH_URL}/jwks`));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: PLATFORM_AUTH_URL.replace('/api/auth', ''),
      audience: [appEnvVariables.ORGANIZATION_SLUG],
    });
    return payload as Oauth2Payload;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw error;
  }
}

export const authMiddleware = (force: boolean = false) =>
  factory.createMiddleware(async (c, next) => {
    const authHeader = c.req.raw.headers.get('Authorization') || '';
    const maybeToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;

    if (maybeToken) {
      const payload = await validateToken(maybeToken);
      c.set('oauth2', payload);
      await next();
    } else {
      c.set('oauth2', null);
      if (force) {
        return c.json({ error: 'Unauthorized' }, 401);
      } else {
        await next();
      }
    }
  });
