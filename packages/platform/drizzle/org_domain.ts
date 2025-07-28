import { sql } from 'drizzle-orm';
import { check, pgTable, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { orgTable } from './org.ts';

export const orgDomainTable = pgTable(
  'org_domain',
  {
    id: text().primaryKey().notNull().default(sql`extensions.nanoid(8)`),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    org_id: text()
      .references(() => orgTable.id)
      .notNull(),

    domain: text().notNull().unique(),
  },
  (table) => [
    check(
      'org_domain_format_chk',
      sql`${table.domain} ~ '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z]{2,})+$'`,
    ),
  ],
);
