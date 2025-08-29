import { getRunTimeEnv } from '@voltade/sdk/client';

import packageJson from '../../package.json';

export const runTimeEnv = getRunTimeEnv(packageJson.name);
