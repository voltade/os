import { drizzle } from 'drizzle-orm/bun-sql';

import * as schema from '#drizzle/index.ts';
import { appEnvVariables } from '#server/env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export const db = drizzle({
  // https://bun.com/docs/api/sql#connection-options
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    tls: true,
    // TODO: adjust pool settings as needed
    max: 10,
    idleTimeout: 10,
  },
  schema: schema,
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
