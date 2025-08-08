import type { AppType } from '@voltade/platform/types';
import { hc } from 'hono/client';

import { getConfig } from './config.ts';

const baseUrl = 'http://127.0.0.1.nip.io';

const config = await getConfig();

export const { api } = hc<AppType>(baseUrl, {
  init: {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.auth.id_token}`,
    },
  },
});
