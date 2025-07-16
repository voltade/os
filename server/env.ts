import {
  type AppEnvVariables,
  appEnvVariablesSchema,
} from '#server/zod/env.ts';

import { type JwtPayload } from "./middleware/auth";

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Variables = AppEnvVariables & {
  jwtPayload?: JwtPayload;
  osOrgId?: string;
};
