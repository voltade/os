import { defineConfig } from 'drizzle-kit';

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
    './src/schema.ts',
    './src/schemas/**/schema.ts',
    './src/schemas/**/enums.ts',
    './src/schemas/**/{tables,views}/*.ts',
  ],
  out: './drizzle',
  schemaFilter: ['public', 'internal', 'account', 'purchase'],
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
