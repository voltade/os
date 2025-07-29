import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  ORG_ID: z.string(),
  OS_URL: z.url(),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
