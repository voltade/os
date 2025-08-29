import type { toast } from 'sonner';

import type { RunTimeEnv } from './env.ts';

declare global {
  interface Window {
    __BASE_URL__?: string;
    __POWERED_BY_QIANKUN__?: boolean;
    __env: {
      [appName: string]: RunTimeEnv & Record<string, string>;
    };
    toast?: typeof toast;
  }
}
