import packageJson from '../../package.json';

export interface RunTimeEnv {
  VITE_PLATFORM_URL: string;
}
export const runTimeEnv = {
  VITE_PLATFORM_URL:
    window.__env[packageJson.name]?.VITE_PLATFORM_URL ??
    import.meta.env.VITE_PLATFORM_URL,
};
