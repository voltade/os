import { SQL } from 'bun';

/**
 * This script is used to grant superuser privileges to the 'postgres' user for local database created by Supabase CLI.
 */

const sql = new SQL({
  url: 'postgresql://supabase_admin:postgres@127.0.0.1:54322/postgres',
});

await sql`alter user postgres with superuser`;
