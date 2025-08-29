import { hc } from 'hono/client';

import type { ApiRoutes } from '#server/index.ts';
import { getApiUrl } from '#src/lib/get-urls.ts';

export const { api } = hc<ApiRoutes>(getApiUrl('/'), {
  headers: async () => {
    const token = localStorage.getItem('voltade-jwt') || '';
    const headers: Record<string, string> = {};
    if (token) headers.authorization = `Bearer ${token}`;
    return headers;
  },
});
