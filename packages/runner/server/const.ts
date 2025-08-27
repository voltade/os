import { appEnvVariables } from '#server/zod/env.ts';

export const BASE_DOMAIN = new URL(appEnvVariables.VITE_PLATFORM_URL).hostname;

export const PROTOCOL = new URL(appEnvVariables.VITE_PLATFORM_URL).protocol;
