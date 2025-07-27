import { SQL } from 'bun';

import { appEnvVariables } from '#server/env.ts';

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = appEnvVariables;

export const sql = new SQL({
  url: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  tls: true,
});
