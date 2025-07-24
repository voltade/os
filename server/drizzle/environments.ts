import { and, isNotNull, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { orgs } from './orgs.ts';

export const environments = pgTable(
  'environments',
  {
    ...DEFAULT_COLUMNS,
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    orgId: uuid('org_id').references(() => orgs.id),
    description: text('description'),
    production: boolean('production').notNull().default(false),
    serviceKey: text('service_key').notNull(),
    anonKey: text('anon_key').notNull(),
    runnerCount: integer('runner_count').notNull().default(1),
    databaseInstanceCount: integer('database_instance_count')
      .notNull()
      .default(1),
  },
  (table) => [
    uniqueIndex('environments_slug_idx')
      .on(table.slug)
      .where(isNotNull(table.slug)),
    uniqueIndex('environments_orgId_prod')
      .on(table.orgId, table.production)
      .where(and(isNotNull(table.orgId), isNotNull(table.production))!), // Forces a single production environment per org
    check(
      'slug_check',
      sql`${table.slug} ~ '^(?![0-9]+$)(?!-)[a-z0-9-]{0,63}(?<!-)$'`,
    ),
  ],
);
