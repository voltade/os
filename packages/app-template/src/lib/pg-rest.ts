import { createClient } from '@voltade/core-schema/pgRest';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = localStorage.getItem('voltade-jwt') || '';

//TODO: fix this later
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required');
}

if (supabaseAnonKey === '') {
  console.log('Key:', supabaseAnonKey);
  throw new Error('Voltade JWT is required. Please log in to get a valid JWT.');
}

export const pgRest = createClient(supabaseUrl, supabaseAnonKey);

export type PgRestClient = typeof pgRest;
