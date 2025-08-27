import { createAuthClient } from '@voltade/sdk';

import { runTimeEnv } from './runtime-env.ts';

export const authClient = createAuthClient(runTimeEnv.VITE_PLATFORM_URL);
