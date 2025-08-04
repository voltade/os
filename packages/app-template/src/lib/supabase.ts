import { createClient } from '@voltade/core-schema/supabase';

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabase;
