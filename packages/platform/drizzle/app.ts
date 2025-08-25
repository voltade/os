import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, unique } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { organization as organizationTable } from './auth.ts';

export const appTable = pgTable(
  'app',
  {
    id: text().primaryKey().notNull().default(sql`extensions.nanoid(9)`),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    organization_id: text()
      .references(() => organizationTable.id)
      .notNull(),

    slug: text().notNull(),
    name: text(),
    description: text(),
    is_public: boolean().notNull().default(false),

    // App build settings
    build_command: text().notNull().default('bun run build'),
    output_path: text().notNull().default('dist'),
    entrypoint: text().notNull().default('dist/index.js'),

    // Git repository settings
    git_repo_url: text().notNull(),
    git_repo_branch: text().notNull().default('main'),
    git_repo_path: text().notNull().default(''),
  },
  (table) => [unique('app_slug_unq').on(table.organization_id, table.slug)],
);

export const appSchema = zodSchemaFactory(appTable);
