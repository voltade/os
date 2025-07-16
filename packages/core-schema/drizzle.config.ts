import { defineConfig } from 'drizzle-kit';

import schemasConfig from './schemas.json';

export default defineConfig({
  dbCredentials: {
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '54322'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
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
