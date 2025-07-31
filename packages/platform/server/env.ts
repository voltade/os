import type { Session } from '#server/lib/auth.ts';
import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#server/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Variables = AppEnvVariables & {
  session: Session['session'] | null;
  user: Session['user'] | null;
};
