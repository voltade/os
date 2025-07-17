import { hc } from 'hono/client';

import type { ApiRoutes } from '#server/index.ts';
import { getApiUrl } from '#utils/get-urls';

// import { supabase, supabaseAnonKey } from './supabase.ts';

export const { api } = hc<ApiRoutes>(getApiUrl('/'), {
  // headers: async () => {
  //   const session = await supabase.auth.getSession();
  //   const token = session.data.session?.access_token ?? supabaseAnonKey;
  //   return {
  //     apikey: supabaseAnonKey,
  //     authorization: `Bearer ${token}`,
  //   };
  // },
});
