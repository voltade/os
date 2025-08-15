import packageJson from '../../package.json';

export interface RuntimeEnv {
  VITE_APP_URL: string;
}

export function getRuntimeEnv() {
  return {
    VITE_APP_URL:
      window.__env[packageJson.name]?.VITE_APP_URL ??
      import.meta.env.VITE_APP_URL,
  };
}
