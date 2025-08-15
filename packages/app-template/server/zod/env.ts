import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.string().default('production'),

  VITE_APP_URL: z.string().url(),
  VITE_PGREST_URL: z.string(),

  PLATFORM_URL: z.url(),
  ORGANIZATION_ID: z.string(),
  ORGANIZATION_SLUG: z.string(),
  ENVIRONMENT_ID: z.string(),
  ENVIRONMENT_SLUG: z.string(),
  RUNNER_SECRET_TOKEN: z.string(),

  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
});

// Validate and export the environment
export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
