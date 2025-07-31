import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { appTable } from './app.ts';
import { orgTable } from './org.ts';

export const appBuildStatus = pgEnum('app_build_status', [
  'pending',
  'building',
  'ready',
  'error',
]);

export const appBuildTable = pgTable(
  'app_build',
  {
    id: text().notNull().default(sql`extensions.nanoid(6)`),
    app_id: text()
      .references(() => appTable.id)
      .notNull(),
    org_id: text()
      .references(() => orgTable.id)
      .notNull(),
    status: appBuildStatus().notNull(),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,
  },
  (table) => [
    primaryKey({
      columns: [table.org_id, table.app_id, table.id],
    }),
  ],
);

export const appBuildSchema = zodSchemaFactory(appBuildTable);
