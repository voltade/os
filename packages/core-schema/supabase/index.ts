import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.gen.ts';

export type { Database } from './database.gen.ts';
export { useProductTemplates } from './hooks/products/useProductTemplates.ts';

export const createClient = (
  VITE_SUPABASE_URL: string,
  VITE_SUPABASE_ANON_KEY: string,
) => {
  return createSupabaseClient<Database>(
    VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY,
  );
};

export type SupabaseClient = ReturnType<typeof createClient>;
