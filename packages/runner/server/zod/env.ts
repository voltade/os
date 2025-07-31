import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  ORGANIZATION_ID: z.string(),
  PLATFORM_URL: z.url(),
  POSTGREST_URL: z.url(),
  SUPABASE_META_URL: z.url(),
  SUPABASE_STORAGE_URL: z.url(),
  SUPABASE_STUDIO_URL: z.url(),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
