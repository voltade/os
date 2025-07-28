import { sql } from 'drizzle-orm';
import { check, pgTable, text, unique } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { orgTable } from './org.ts';

export const appTable = pgTable(
  'app',
  {
    id: text().primaryKey().notNull().default(sql`extensions.nanoid(8)`),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    org_id: text()
      .references(() => orgTable.id)
      .notNull(),

    slug: text().notNull(),
    display_name: text(),
    description: text(),
  },
  (table) => [
    check(
      'app_slug_format_chk',
      sql`${table.slug}::text ~ '^(?![0-9]+$)(?!-)[a-z0-9-]{0,31}(?<!-)$'`,
    ),
    unique('app_slug_unq').on(table.org_id, table.slug),
  ],
);

export const appSchema = zodSchemaFactory(appTable);
