import { z } from 'zod';

// Define the schema
export const appEnvVariablesSchema = z.object({
  VITE_NODE_ENV: z.string().default('production'),

  VITE_APP_URL: z.string().url(),
});

// Validate and export the environment
export const env = appEnvVariablesSchema.parse({
  VITE_NODE_ENV: process.env.VITE_NODE_ENV,

  VITE_APP_URL: process.env.VITE_APP_URL,
});

export type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;
