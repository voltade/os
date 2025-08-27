import { platformEnvVariables } from './env.ts';

export const BASE_DOMAIN = new URL(platformEnvVariables.VITE_APP_URL).hostname;
