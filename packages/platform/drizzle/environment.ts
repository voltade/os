import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { organization as organizationTable } from './auth.ts';

export const environmentTable = pgTable(
  'environment',
  {
    id: text().primaryKey().notNull().default(sql`extensions.nanoid(8)`),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    organization_id: text()
      .references(() => organizationTable.id)
      .notNull(),
    slug: text().notNull(),

    name: text(),
    description: text(),

    is_production: boolean().notNull().default(false),
    runner_count: integer().notNull().default(1),
    database_instance_count: integer().notNull().default(1),
  },
  (table) => [
    check(
      'environment_slug_format_chk',
      sql`${table.id} ~ '^(?![0-9]+$)(?!-)[a-z0-9-]{3,31}(?<!-)$'`,
    ),
    unique('environment_slug_unq').on(table.organization_id, table.slug),
    uniqueIndex('environment_is_production_unq')
      .on(table.organization_id)
      .where(sql`${table.is_production} is true`),
  ],
);

export const environmentSchema = zodSchemaFactory(environmentTable);
