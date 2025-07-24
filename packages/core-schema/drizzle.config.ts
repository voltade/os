import { defineConfig } from 'drizzle-kit';

import schemasConfig from './schemas.json';
import { appEnvVariables } from './utils/env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export default defineConfig({
  dbCredentials: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    //TODO: reference ca.crt in the future
    // ssl: {
    //   rejectUnauthorized: false,
    // },
    ssl: false,
  },
  dialect: 'postgresql',
  schema: [
    './schema.ts',
    './schemas/**/schema.ts',
    './schemas/**/enums.ts',
    './schemas/**/{tables,views}/*.ts',
  ],
  out: './drizzle',
  schemaFilter: schemasConfig.schemas,
  tablesFilter: '*',
  entities: {
    roles: {
      provider: '',
      exclude: [],
      include: [],
    },
  },
  breakpoints: true,
});
