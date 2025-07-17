import { drizzle } from 'drizzle-orm/bun-sql';

import schema from '../schemas/index.ts';
import { appEnvVariables } from './env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export const db = drizzle({
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  schema: schema,
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Db = typeof db;
