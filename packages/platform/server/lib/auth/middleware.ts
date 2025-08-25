import { createRemoteJWKSet, jwtVerify } from 'jose';

import { type Oauth2Payload, platformEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { auth, BASE_URL } from './index.ts';

async function validateToken(token: string): Promise<Oauth2Payload> {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${BASE_URL}/jwks`));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: BASE_URL.replace('/api/auth', ''),
      audience: [BASE_URL, 'cli'],
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

    // 1) Static Bearer token(s)
    if (maybeToken) {
      const staticTokens = [
        platformEnvVariables.ARGOCD_ENVIRONMENT_GENERATOR_TOKEN,
        platformEnvVariables.RUNNER_SECRET_TOKEN,
        platformEnvVariables.PROXY_SECRET_TOKEN,
      ];
      if (staticTokens.length > 0 && staticTokens.includes(maybeToken)) {
        c.set('oauth2', null);
        c.set('user', null);
        c.set('session', null);
        c.set('authType', 'static');
        return next();
      }
    }

    // 2) JWT Bearer token (OIDC/JWK verified)
    if (maybeToken) {
      try {
        const payload = await validateToken(maybeToken);
        c.set('oauth2', payload);
        c.set('authType', 'jwt');
        return next();
      } catch {
        console.log('Token validation failed:', maybeToken);
      }
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (force && !session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    if (!session) {
      c.set('user', null);
      c.set('session', null);
      c.set('authType', 'none');
      return next();
    }
    c.set('user', session.user);
    c.set('session', session.session);
    c.set('authType', 'session');
    return next();
  });
