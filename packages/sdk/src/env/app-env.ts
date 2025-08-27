import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.string().default('production'),

  // PGREST
  VITE_PGREST_URL: z.url(),

  // Platform
  PLATFORM_URL: z.url(),
  VITE_PLATFORM_URL: z.url(),

  // Organization & Environment
  ORGANIZATION_ID: z.string(),
  ORGANIZATION_SLUG: z.string(),
  ENVIRONMENT_ID: z.string(),
  ENVIRONMENT_SLUG: z.string(),

  // Database
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
});

export const env = appEnvVariablesSchema.parse(process.env);

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
