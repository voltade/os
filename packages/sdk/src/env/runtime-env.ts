import z from 'zod';

import packageJson from '../../package.json';

const runTimeEnvSchema = z.object({
  VITE_PGREST_URL: z.string(),
  VITE_PLATFORM_URL: z.string(),
});

export type RunTimeEnv = z.infer<typeof runTimeEnvSchema>;

declare global {
  interface Window {
    __env: {
      [packageJson.name]: RunTimeEnv & Record<string, string>;
    };
  }
}

export function getRunTimeEnv() {
  return runTimeEnvSchema.parse({
    VITE_PGREST_URL:
      window.__env[packageJson.name]?.VITE_PGREST_URL ??
      import.meta.env.VITE_PGREST_URL,
    VITE_PLATFORM_URL:
      window.__env[packageJson.name]?.VITE_PLATFORM_URL ??
      import.meta.env.VITE_PLATFORM_URL,
  });
}
