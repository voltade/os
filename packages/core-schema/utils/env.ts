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

export const appEnvVariables = appEnvVariablesSchema.parse(process.env);
