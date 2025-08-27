import { createMiddleware } from 'hono/factory';
import { jwt as honoJwt } from 'hono/jwt';
import type { AlgorithmTypes } from 'hono/utils/jwt/jwa';

import type { Variables as AppVariables } from '#server/env.ts';
import type { JwtPayload } from '#server/lib/jwt.ts';
import { getKeyPair } from '#server/lib/jwt.ts';

export type Variables = AppVariables & {
  jwtPayload: JwtPayload;
};

export type Options = Parameters<typeof honoJwt>[0];

export function jwt(options?: Options) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const { publicKey, alg } = await getKeyPair();
    return honoJwt({
      ...options,
      secret: publicKey,
      alg: alg as AlgorithmTypes,
    })(c, next);
  });
}
