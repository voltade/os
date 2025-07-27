import { sql } from 'drizzle-orm';
import { check, pgTable, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';

export const orgTable = pgTable(
  'org',
  {
    id: text().primaryKey().notNull(),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    display_name: text().notNull(),
  },
  (table) => [
    check(
      'orgs_id_check',
      sql`${table.id}::text ~ '^(?![0-9]+$)(?!-)[a-z0-9-]{0,31}(?<!-)$'`,
    ),
  ],
);
