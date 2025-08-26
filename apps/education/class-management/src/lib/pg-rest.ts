import { createClient } from '@voltade/core-schema/pgRest';

import { runTimeEnv } from './runtime-env.ts';

// const pgRestUrl = 'http://postgrest.voltade-main.127.0.0.1.nip.io';
const pgRestUrl = runTimeEnv.VITE_PGREST_URL;
const jwtToken = localStorage.getItem('voltade-jwt') || '';

if (!pgRestUrl) {
  throw new Error('VITE_PGREST_URL is required');
}

// We do not check JWT presence because this app is supposed to be publicly accessible.
// if (jwtToken === '') {
//   throw new Error('Voltade JWT is required. Please log in to get a valid JWT.');
// }

export const pgRest = createClient(pgRestUrl, jwtToken);

export type PgRestClient = typeof pgRest;
