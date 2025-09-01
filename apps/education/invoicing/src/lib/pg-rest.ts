import { getPgRestClient } from '@voltade/sdk/client';

import { runTimeEnv } from './runtime-env.ts';

export const pgRest = getPgRestClient(runTimeEnv.VITE_PGREST_URL);
