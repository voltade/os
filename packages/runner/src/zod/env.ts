import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),

  ORG_ID: z.string(),
  OS_URL: z.url(),

  CHART_NAME: z.string(),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
