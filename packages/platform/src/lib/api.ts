import { hc } from 'hono/client';

import type { AppType } from '#server/index.ts';

export const { api } = hc<AppType>('/', {
  init: {
    credentials: 'include',
  },
});
