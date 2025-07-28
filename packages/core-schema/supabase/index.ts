import { PostgrestClient } from '@supabase/postgrest-js';

import type { Database } from './database.gen.ts';

export type { Database } from './database.gen.ts';
export { useProductTemplates } from './hooks/products/useProductTemplates.ts';

export const createClient = (
  VITE_SUPABASE_URL: string,
  VITE_SUPABASE_ANON_KEY: string,
) => {
  return new PostgrestClient<Database>(VITE_SUPABASE_URL, {
    headers: {
      Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
};

export type SupabaseClient = ReturnType<typeof createClient>;
