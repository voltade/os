import type { AppType } from '@voltade/platform/types';
import { hc } from 'hono/client';

import { getConfig } from './config.ts';

const baseUrl = 'http://127.0.0.1.nip.io';

const config = await getConfig();

export const { api } = hc<AppType>(baseUrl, {
  init: {
    headers: {
      'Content-Type': 'application/json',
      // Use cookie-based session for server to accept Better Auth session
      Cookie: `better-auth.session_token=${config.auth.session_token}`,
    },
  },
});
