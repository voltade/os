import { sql } from 'drizzle-orm';
import { check, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';

export const orgs = pgTable(
  'orgs',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`).notNull(),
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
