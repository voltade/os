import { hc } from 'hono/client';

import type { ApiRoutes } from '#server/index.ts';
import { getApiUrl } from '#src/lib/get-urls.ts';

// import { supabase, supabaseAnonKey } from './supabase.ts';

// TODO: Get token from local storage

export const { api } = hc<ApiRoutes>(getApiUrl('/'), {
  headers: async () => {
    return {
      // authorization: `Bearer ${token}`,
    };
  },
});
