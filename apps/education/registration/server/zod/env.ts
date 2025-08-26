import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.string().default('production'),

  VITE_PLATFORM_URL: z.url(),

  VITE_PGREST_URL: z.url(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
