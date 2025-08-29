import type { Hono } from 'hono';
import { hc } from 'hono/client';

import { getApiUrl } from './get-urls.ts';

// biome-ignore lint/suspicious/noExplicitAny: needed for the Hono type
export const createApiClient = <T extends Hono<any, any, any>>() => {
  return hc<T>(getApiUrl('/'), {
    headers: async () => {
      const token = localStorage.getItem('voltade-jwt') || '';
      const headers: Record<string, string> = {};
      if (token) headers.authorization = `Bearer ${token}`;
      return headers;
    },
  });
};
