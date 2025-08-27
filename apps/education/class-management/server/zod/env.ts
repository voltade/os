import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.string().default('production'),

  VITE_PLATFORM_URL: z.url(),
  PLATFORM_URL: z.url(),

  VITE_PGREST_URL: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),

  PUBLIC_KEY: z.string(),
});

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
