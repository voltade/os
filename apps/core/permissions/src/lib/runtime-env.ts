import packageJson from '../../package.json';

export interface RunTimeEnv {
  VITE_APP_URL: string;
}
export const runTimeEnv = {
  VITE_APP_URL:
    window.__env[packageJson.name]?.VITE_APP_URL ??
    import.meta.env.VITE_APP_URL,
};
