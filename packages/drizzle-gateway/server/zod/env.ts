import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  PROXY_SECRET_TOKEN: z.string(),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
