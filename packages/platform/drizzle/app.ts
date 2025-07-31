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

    // App build settings
    build_command: text().notNull().default('bun run build'),
    output_path: text().notNull().default('dist'),
    entrypoint: text().notNull().default('dist/index.js'),

    // Git repository settings
    git_repo_url: text().notNull(),
    git_repo_branch: text().notNull().default('main'),
    git_repo_path: text().notNull().default(''),
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
