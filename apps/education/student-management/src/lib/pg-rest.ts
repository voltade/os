import { createClient } from '@voltade/core-schema/pgRest';

import { runTimeEnv } from './runtime-env.ts';

const pgRestUrl = runTimeEnv.VITE_PGREST_URL;
const jwtToken = localStorage.getItem('voltade-jwt') || '';

if (!pgRestUrl) {
  throw new Error('VITE_PGREST_URL is required');
}

if (jwtToken === '') {
  throw new Error('Voltade JWT is required. Please log in to get a valid JWT.');
}

export const pgRest = createClient(pgRestUrl, jwtToken);

export type PgRestClient = typeof pgRest;
