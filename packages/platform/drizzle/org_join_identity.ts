import { pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { orgTable } from './org.ts';

export const orgJoinIdentityTable = pgTable(
  'org_join_identity',
  {
    org_id: text()
      .references(() => orgTable.id)
      .notNull(),
    identity_id: uuid().notNull(),
    created_at: DEFAULT_COLUMNS.created_at,
  },
  (table) => [primaryKey({ columns: [table.org_id, table.identity_id] })],
);
