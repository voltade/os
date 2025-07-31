import type { JWTPayload } from 'hono/utils/jwt/types';

import type { Session } from '#server/lib/auth.ts';
import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#server/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Variables = AppEnvVariables & {
  jwtPayload?: JWTPayload;
  osOrgId?: string;
  session: Session['session'] | null;
  user: Session['user'] | null;
};
