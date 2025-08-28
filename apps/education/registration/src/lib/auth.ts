import { createAuthClient, getRunTimeEnv } from '@voltade/sdk/client';

export const authClient = createAuthClient(getRunTimeEnv().VITE_PLATFORM_URL);
