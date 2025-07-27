import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { orgTable } from './org.ts';

export const environmentTable = pgTable(
  'environment',
  {
    id: text().primaryKey().notNull().default(sql`extensions.nanoid(6)`),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    org_id: text()
      .references(() => orgTable.id)
      .notNull(),

    display_name: text(),
    description: text(),

    is_production: boolean().notNull().default(false),

    service_key: text().notNull(),
    anon_key: text().notNull(),
    runner_count: integer().notNull().default(1),
    database_instance_count: integer().notNull().default(1),
  },
  (table) => [
    check(
      'environment_id_format_chk',
      sql`${table.id} ~ '^(?![0-9]+$)(?!-)[a-z0-9-]{6}(?<!-)$'`,
    ),
    uniqueIndex('environment_is_production_unq')
      .on(table.org_id)
      .where(sql`${table.is_production} is true`),
  ],
);
