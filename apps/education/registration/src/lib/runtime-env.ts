import packageJson from '../../package.json';

export interface RunTimeEnv {
  VITE_PGREST_URL: string;
  VITE_PLATFORM_URL: string;
}

export const runTimeEnv = {
  VITE_PGREST_URL:
    window.__env[packageJson.name]?.VITE_PGREST_URL ??
    import.meta.env.VITE_PGREST_URL,
  VITE_PLATFORM_URL:
    window.__env[packageJson.name]?.VITE_PLATFORM_URL ??
    import.meta.env.VITE_PLATFORM_URL,
};
