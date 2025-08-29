import { createClient } from '@voltade/core-schema/pgRest';

export const getPgRestClient = (pgRestUrl: string) => {
  const jwtToken = localStorage.getItem('voltade-jwt') || '';

  if (!pgRestUrl) {
    throw new Error('VITE_PGREST_URL is required');
  }

  if (jwtToken === '') {
    throw new Error(
      'Voltade JWT is required. Please log in to get a valid JWT.',
    );
  }

  return createClient(pgRestUrl, jwtToken);
};
