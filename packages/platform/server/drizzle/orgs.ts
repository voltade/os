import { sql } from 'drizzle-orm';
import { check, pgTable, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';

export const orgs = pgTable(
  'orgs',
  {
    id: text('id').primaryKey().default(sql`extensions.nanoid()`).notNull(),
    name: text('name').notNull(),
    updatedAt: DEFAULT_COLUMNS.updatedAt,
    createdAt: DEFAULT_COLUMNS.createdAt,
  },
  (table) => [
    check(
      'orgs_id_check',
      sql`${table.id}::text ~ '^(?![0-9]+$)(?!-)[a-z0-9-]{0,63}(?<!-)$'`,
    ),
  ],
);
