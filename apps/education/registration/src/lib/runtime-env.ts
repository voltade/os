import z from 'zod';

export type RunTimeEnv = z.infer<typeof runTimeEnvSchema>;

const runTimeEnvSchema = z.object({
  VITE_PGREST_URL: z.string(),
  VITE_PLATFORM_URL: z.string(),
});

export const runTimeEnv = runTimeEnvSchema.parse({
  VITE_PGREST_URL: import.meta.env.VITE_PGREST_URL,
  VITE_PLATFORM_URL: import.meta.env.VITE_PLATFORM_URL,
});
