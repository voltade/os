import { createAuthClient } from '@voltade/auth';

import { runTimeEnv } from './runtime-env.ts';

export const authClient = createAuthClient(runTimeEnv.VITE_PLATFORM_URL);
