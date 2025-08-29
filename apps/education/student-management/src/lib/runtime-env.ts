import { getRunTimeEnv } from '@voltade/sdk/client';

import packageJson from '../../package.json';

export interface RunTimeEnv {
  VITE_PLATFORM_URL: string;
  VITE_PGREST_URL: string;
}

export const runTimeEnv = getRunTimeEnv(packageJson.name);
