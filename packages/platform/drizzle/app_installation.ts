import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { appTable } from './app.ts';
import { appBuildTable } from './app_build.ts';
import { environmentTable } from './environment.ts';
import { orgTable } from './org.ts';

export const appInstallationTable = pgTable(
  'app_installation',
  {
    org_id: text()
      .notNull()
      .references(() => orgTable.id),
    environment_id: text()
      .notNull()
      .references(() => environmentTable.id),
    app_id: text()
      .notNull()
      .references(() => appTable.id),
    app_build_id: text()
      .notNull()
      .references(() => appBuildTable.id),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,
  },
  (table) => [
    primaryKey({ columns: [table.app_id, table.environment_id, table.org_id] }),
  ],
);

export const appInstallationSchema = zodSchemaFactory(appInstallationTable);
