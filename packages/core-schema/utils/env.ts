import { z } from 'zod';

// Define the schema
const appEnvVariablesSchema = z.object({
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),

  FGA_CLIENT_ID: z.string().optional(),
  FGA_API_TOKEN_ISSUER: z.string().optional(),
  FGA_API_AUDIENCE: z.string().optional(),
  FGA_CLIENT_SECRET: z.string().optional(),
  FGA_STORE_ID: z.string().default('< MISSING STORE ID >'), // TODO: make this required
  FGA_AUTHORIZATION_MODEL_ID: z.string().default('< MISSING MODEL ID >'), // TODO: make this required
  FGA_API_URL: z.string().url().default('http://localhost:8080'),
});

// Validate and export the environment
export const env = appEnvVariablesSchema.parse({
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,

  FGA_CLIENT_ID: process.env.FGA_CLIENT_ID,
  FGA_API_TOKEN_ISSUER: process.env.FGA_API_TOKEN_ISSUER,
  FGA_API_AUDIENCE: process.env.FGA_API_AUDIENCE,
  FGA_CLIENT_SECRET: process.env.FGA_CLIENT_SECRET,
  FGA_STORE_ID: process.env.FGA_STORE_ID,
  FGA_AUTHORIZATION_MODEL_ID: process.env.FGA_AUTHORIZATION_MODEL_ID,
  FGA_API_URL: process.env.FGA_API_URL,
});

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);
