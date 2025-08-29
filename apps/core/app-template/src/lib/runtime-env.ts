import { getRunTimeEnv } from '@voltade/sdk/client';

import { APP_NAME } from '#shared/const';

export const runTimeEnv = getRunTimeEnv(APP_NAME);
