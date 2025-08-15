import type { Session } from '#server/lib/auth/index.ts';
import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#server/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Oauth2Payload = {
  sub: string;
  aud: string;
  iat: number;
  acr: string;
  given_name: string;
  name: string;
  profile: string | null;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  exp: number;
};

export type Variables = AppEnvVariables & {
  session: Session['session'] | null;
  user: Session['user'] | null;
  oauth2: Oauth2Payload | null;
  authType: 'static' | 'jwt' | 'session' | 'none';
};

/*
{
[server]   "sub": "admin",
[server]   "aud": "cli",
[server]   "iat": 1754559550,
[server]   "acr": "urn:mace:incommon:iap:silver",
[server]   "given_name": "Admin",
[server]   "name": "Admin",
[server]   "profile": null,
[server]   "updated_at": "2025-08-07T10:59:47.000Z",
[server]   "email": "admin@voltade.com",
[server]   "email_verified": true,
[server]   "iss": "http://127.0.0.1.nip.io",
[server]   "exp": 1757151550
[server] }
*/
