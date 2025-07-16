import { z } from 'zod';

const temp = z.string().optional().default('');

export const appEnvVariablesSchema = z.object({
  VITE_APP_URL: z.string().url(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),

  NODE_ENV: z.enum(['development', 'production']).default('development'),

  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),

  CLUSTER_NAME: temp,
  CLUSTER_SERVER: temp,
  CLUSTER_CA_DATA: temp,
  CLUSTER_SKIP_TLS_VERIFY: z
    .preprocess((v) => v === 'true', z.boolean())
    .default(false),

  USER_NAME: temp,
  USER_TOKEN: temp,
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
