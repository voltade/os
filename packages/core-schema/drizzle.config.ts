import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'drizzle-kit';

import schemasConfig from './schemas.json';
import { appEnvVariables } from './utils/env.ts';

const { DB_NAME, DB_USER, DB_HOST, DB_PORT, DB_PASSWORD } = appEnvVariables;

export default defineConfig({
  dbCredentials: {
    url: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require`,
    ssl: {
      ca: readFileSync(
        join(process.cwd(), '../../terraform/kind-local/certs/ca.crt'),
        'utf8',
      ),
    },
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
