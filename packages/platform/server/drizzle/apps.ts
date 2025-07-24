import { pgTable, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { orgs } from './orgs.ts';

export const apps = pgTable('apps', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
  orgId: text('org_id').references(() => orgs.id),
  description: text('description'),
  slug: text('slug').notNull(),
});
