import { z } from 'zod';

import { runTimeEnvSchema } from '../client/env.ts';

// Define the schema
export const baseAppEnvVariablesSchema = z
  .object({
    NODE_ENV: z.string().default('production'),

    // Platform
    PLATFORM_URL: z.url(),
    RUNNER_KEY: z.string().default(''),

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
  })
  .extend(runTimeEnvSchema.shape);

export const baseEnv = baseAppEnvVariablesSchema.parse(process.env);

export type BaseAppEnvVariables = z.infer<typeof baseAppEnvVariablesSchema>;
