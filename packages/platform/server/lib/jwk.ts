import * as jose from 'jose';

import { appEnvVariables } from '#server/env.ts';

const jwkSet = JSON.parse(
  atob(appEnvVariables.JWKS_PRIVATE_BASE64),
) as jose.JSONWebKeySet;
const privateJWK = jwkSet.keys[0] as jose.JWK_RSA_Private;
if (!privateJWK || privateJWK.kty !== 'RSA' || !privateJWK.alg) {
  throw new Error('Invalid JWK: Expected an RSA key');
}

export const privateKey = await jose.importJWK(privateJWK, privateJWK.alg);

export const publicJWK: jose.JWK_RSA_Public = {
  kty: privateJWK.kty,
  e: privateJWK.e,
  use: privateJWK.use,
  kid: privateJWK.kid,
  alg: privateJWK.alg,
  n: privateJWK.n,
};
export const publicKey = JSON.stringify(publicJWK);

export const anonJwt = new jose.SignJWT({
  role: 'anon',
})
  .setProtectedHeader({ alg: privateJWK.alg })
  .setIssuedAt(new Date('2025-08-01'))
  .setExpirationTime(new Date('2035-08-01'));

export const serviceJwt = new jose.SignJWT({
  role: 'service_role',
})
  .setProtectedHeader({ alg: privateJWK.alg })
  .setIssuedAt(new Date('2025-08-01'))
  .setExpirationTime(new Date('2035-08-01'));
