import { drizzle } from 'drizzle-orm/bun-sql';

import { appEnvVariables } from './env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export const db = drizzle({
  connection: {
    hostname: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
  },
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Db = typeof db;
