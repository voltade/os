import { appEnvVariablesSchema } from '#server/zod/env.ts';

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);
