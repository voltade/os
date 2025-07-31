import * as jose from 'jose';

export async function signJwt(
  alg: string,
  privateKey: jose.CryptoKey | Uint8Array<ArrayBufferLike>,
  role: 'anon' | 'service_role',
  audience: string[],
) {
  return new jose.SignJWT({ role })
    .setProtectedHeader({ alg })
    .setIssuedAt(new Date('2025-08-01'))
    .setExpirationTime(new Date('2035-08-01'))
    .setAudience(audience)
    .sign(privateKey);
}
