import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { apps } from './apps.ts';
import { environments } from './environments.ts';

export const appInstallations = pgTable(
  'app_installations',
  {
    appId: text('app_id').references(() => apps.id),
    slug: text('slug').notNull(),
    environmentId: text('environment_id').references(() => environments.id),
    createdAt: DEFAULT_COLUMNS.createdAt,
    updatedAt: DEFAULT_COLUMNS.updatedAt,
  },
  (table) => [
    primaryKey({ columns: [table.appId, table.slug, table.environmentId] }),
  ],
);
