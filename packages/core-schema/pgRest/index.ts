import { PostgrestClient } from '@supabase/postgrest-js';

import type { Database } from './database.gen.ts';

export type { Database } from './database.gen.ts';
export { useProductTemplates } from './hooks/products/useProductTemplates.ts';

export const createClient = (
  POSTGRES_URL: string,
  POSTGRES_JWT_TOKEN: string,
) => {
  return new PostgrestClient<Database>(POSTGRES_URL, {
    headers: {
      Authorization: `Bearer ${POSTGRES_JWT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
};

export type PgRestClient = ReturnType<typeof createClient>;
