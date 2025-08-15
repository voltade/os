import type { Session } from '#server/lib/auth/index.ts';
import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#server/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Oauth2Payload = {
  sub: string;
  aud: string[];
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
