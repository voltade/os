import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { appTable } from './app.ts';
import { organization as organizationTable } from './auth.ts';

export const appBuildStatus = pgEnum('app_build_status', [
  'pending',
  'building',
  'ready',
  'error',
]);

export const appBuildTable = pgTable('app_build', {
  id: text().notNull().default(sql`extensions.nanoid()`).primaryKey(),
  app_id: text()
    .references(() => appTable.id)
    .notNull(),
  organization_id: text()
    .references(() => organizationTable.id)
    .notNull(),
  status: appBuildStatus().notNull(),
  core_schema_version: text().notNull(),
  created_at: DEFAULT_COLUMNS.created_at,
  updated_at: DEFAULT_COLUMNS.updated_at,
});

export const appBuildSchema = zodSchemaFactory(appBuildTable);
