import { z } from 'zod';

// Define the schema
const appEnvVariablesSchema = z.object({
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_NAME: z.string(),
});

// Validate and export the environment
export const env = appEnvVariablesSchema.parse({
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
});

type AppEnvVariables = z.infer<typeof appEnvVariablesSchema>;

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);

export type Variables = Record<string, unknown> & AppEnvVariables;
