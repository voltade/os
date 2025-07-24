import { SQL } from 'bun';

import { appEnvVariables } from '#server/env.ts';

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = appEnvVariables;

const DB_SUPERUSER_PASSWORD = process.env.DB_SUPERUSER_PASSWORD;
if (!DB_SUPERUSER_PASSWORD) {
  throw new Error('DB_SUPERUSER_PASSWORD environment variable is required');
}

export const appSql = new SQL({
  url: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  tls: true,
});

export const superuserSql = new SQL({
  url: `postgresql://postgres:${DB_SUPERUSER_PASSWORD}@${DB_HOST}:${DB_PORT}/postgres`,
  tls: true,
});
