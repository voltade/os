import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.string().default('production'),

  VITE_APP_URL: z.string().url(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
});

// Validate and export the environment
export const env = appEnvVariablesSchema.parse({
  VITE_NODE_ENV: process.env.VITE_NODE_ENV,

  VITE_APP_URL: process.env.VITE_APP_URL,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
