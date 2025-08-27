import { appEnvVariables } from '#server/env.ts';

export const BASE_DOMAIN = new URL(appEnvVariables.VITE_PLATFORM_URL).hostname;

export const PROTOCOL = new URL(appEnvVariables.VITE_PLATFORM_URL).protocol;
