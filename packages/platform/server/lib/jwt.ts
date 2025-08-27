import { symmetricDecrypt } from 'better-auth/crypto';
import { desc } from 'drizzle-orm';
import * as jose from 'jose';

import { jwks as jwksTable } from '#drizzle/auth.ts';
import { platformEnvVariables } from '#server/env.ts';
import { db } from '#server/lib/db.ts';

interface KeyPair {
  publicJWKS: jose.JSONWebKeySet;
  publicJWK: jose.JWK;
  privateKey: CryptoKey | Uint8Array<ArrayBufferLike>;
  alg: string;
}

let keyPairCache: KeyPair | null = null;

export async function getKeyPair() {
  if (keyPairCache) {
    return keyPairCache;
  }

  // Pass the latest two JWKs to the PostgREST to be used as the JWT_SECRET config: https://docs.postgrest.org/en/v13/references/auth.html#asym-keys
  const jwks = await db
    .select()
    .from(jwksTable)
    .orderBy(desc(jwksTable.createdAt))
    .limit(2);
  const publicJWKS: jose.JSONWebKeySet = {
    keys: jwks.map((jwk) => {
      const publicKey = JSON.parse(jwk.publicKey) as jose.JWK_RSA_Public;
      return {
        ...publicKey,
        kid: jwk.id,
      };
    }),
  };
  const publicJWK = publicJWKS.keys[0];
  if (!publicJWK) {
    throw new Error('No JWK found');
  }
  const alg = publicJWKS.keys[0]?.alg as string;

  // Decrypt the private key to be used for signing long-live anon and service_role tokens
  const decryptedPrivateKey = await symmetricDecrypt({
    key: platformEnvVariables.AUTH_SECRET,
    data: JSON.parse(jwks[0]?.privateKey ?? ''),
  });
  const privateWebKey = JSON.parse(decryptedPrivateKey) as jose.JWK_RSA_Private;
  const privateKey = await jose.importJWK(privateWebKey, alg);

  const keyPair: KeyPair = {
    publicJWKS,
    publicJWK,
    privateKey,
    alg,
  };

  keyPairCache = keyPair;
  return keyPair;
}

export type JwtPayload =
  | (jose.JWTPayload & {
      role: 'anon' | 'service_role';
      aud: string[]; // [organizationSlug]
    })
  | (jose.JWTPayload & {
      role: 'runner';
      orgId: string;
      orgSlug: string;
      envId: string;
      envSlug: string;
    });

export async function signJwt({ role, aud, ...payload }: JwtPayload) {
  const { privateKey, alg } = await getKeyPair();
  const signer = new jose.SignJWT({ role, ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt(new Date('2025-08-01'))
    .setExpirationTime(new Date('2035-08-01'));
  if (aud) {
    signer.setAudience(aud);
  }
  return signer.sign(privateKey);
}
