import * as schema from '@voltade/platform/drizzle';
import { drizzle } from 'drizzle-orm/bun-sql';

import { getConfig } from './config.ts';

export async function getDb() {
  const config = await getConfig();
  return drizzle({
    // https://bun.com/docs/api/sql#connection-options
    connection: {
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      tls: true,
      // TODO: adjust pool settings as needed
      max: 10,
      idleTimeout: 10,
    },
    schema: schema,
  });
}
