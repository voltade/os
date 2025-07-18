import type { JWTPayload } from 'hono/utils/jwt/types';

import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#runner/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Variables = AppEnvVariables & {
  jwtPayload?: JWTPayload;
  osOrgId?: string;
};
