import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { appTable } from './app.ts';
import { environmentTable } from './environment.ts';
import { orgTable } from './org.ts';

export const appInstallationTable = pgTable(
  'app_installation',
  {
    app_id: text()
      .notNull()
      .references(() => appTable.id),
    environment_id: text()
      .notNull()
      .references(() => environmentTable.id),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    org_id: text()
      .notNull()
      .references(() => orgTable.id),
  },
  (table) => [
    primaryKey({ columns: [table.app_id, table.environment_id, table.org_id] }),
  ],
);

export const appInstallationSchema = zodSchemaFactory(appInstallationTable);
