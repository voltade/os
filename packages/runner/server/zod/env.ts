import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PLATFORM_URL: z.url(),
  VITE_PLATFORM_URL: z.url(),

  // Environment variables
  ORGANIZATION_ID: z.string(),
  ORGANIZATION_SLUG: z.string(),
  ENVIRONMENT_ID: z.string(),
  ENVIRONMENT_SLUG: z.string(),
  RUNNER_SECRET_TOKEN: z.string(),

  // Supabase
  POSTGREST_URL: z.url(),
  SUPABASE_META_URL: z.url(),
  SUPABASE_STORAGE_URL: z.url(),
  SUPABASE_STUDIO_URL: z.url(),

  // S3
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_S3_BUCKET: z.string(),
  AWS_S3_ENDPOINT: z.string(),
  FORCE_PATH_STYLE: z.coerce.boolean().default(true),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
