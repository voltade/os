import { hc } from 'hono/client';

import type { ApiRoutes } from '#server/index.ts';
import { getApiUrl } from '#src/lib/get-urls.ts';

const jwtToken = localStorage.getItem('voltade-jwt') || '';

export const { api } = hc<ApiRoutes>(getApiUrl('/'), {
  headers: async () => {
    return {
      authorization: `Bearer ${jwtToken}`,
    };
  },
});
