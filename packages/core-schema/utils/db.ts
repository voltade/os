import { readFileSync } from 'fs';
import { join } from 'path';
import { drizzle } from 'drizzle-orm/bun-sql';

import schema from '../schemas/index.ts';
import { appEnvVariables } from './env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export const db = drizzle({
  connection: {
    url: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`,
    ssl: {
      rejectUnauthorized: false,
      ca: readFileSync(
        join(process.cwd(), '../../terraform/kind-local/certs/ca.crt'),
        'utf8',
      ),
    },
  },
  schema: schema,
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type Db = typeof db;
