import { drizzle } from 'drizzle-orm/bun-sql';

import * as schema from '#server/drizzle';
import { vaultSecrets } from '#server/drizzle/vault/secrets';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = process.env;

export const db = drizzle({
  connection: {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  schema: {
    ...schema.orgs,
    ...schema.environments,
    ...schema.envVars,
    ...vaultSecrets,
  },
});

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
