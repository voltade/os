import z from 'zod';

const runTimeEnvSchema = z.object({
  VITE_PGREST_URL: z.string(),
  VITE_PLATFORM_URL: z.string(),
});

export type RunTimeEnv = z.infer<typeof runTimeEnvSchema>;

declare global {
  interface Window {
    __env: {
      [appName: string]: RunTimeEnv & Record<string, string>;
    };
  }
}

export function getRunTimeEnv(appName: string): RunTimeEnv {
  return runTimeEnvSchema.parse({
    VITE_PGREST_URL:
      window.__env[appName]?.VITE_PGREST_URL ??
      import.meta.env.VITE_PGREST_URL ??
      '',
    VITE_PLATFORM_URL:
      window.__env[appName]?.VITE_PLATFORM_URL ??
      import.meta.env.VITE_PLATFORM_URL ??
      '',
  });
}
