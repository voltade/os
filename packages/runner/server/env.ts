import type { JWTPayload } from 'hono/utils/jwt/types';

import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#server/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type VoltadeJWTPayload = JWTPayload & {
  aud: string | string[];
  roles: Record<string, string>;
  role: string;
};

export type Variables = AppEnvVariables & {
  jwtPayload?: VoltadeJWTPayload;
};
