import { z } from 'zod';

export const appEnvVariablesSchema = z.object({
  //TEST_ENV: z.string(),
});

export const env = appEnvVariablesSchema.parse(process.env);
