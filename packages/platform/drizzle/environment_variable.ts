import { sql } from 'drizzle-orm';
import { check, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, zodSchemaFactory } from './_helpers.ts';
import { environmentTable } from './environment.ts';
import { orgTable } from './org.ts';
import { secretsTable } from './vault/secrets.ts';

export const environmentVariableTable = pgTable(
  'environment_variable',
  {
    id: text().primaryKey().notNull().default(sql`extensions.nanoid()`),
    created_at: DEFAULT_COLUMNS.created_at,
    updated_at: DEFAULT_COLUMNS.updated_at,

    org_id: text()
      .references(() => orgTable.id)
      .notNull(),
    environment_id: text()
      .references(() => environmentTable.id)
      .notNull(),
    secret_id: uuid().references(() => secretsTable.id),

    name: text().notNull(),
    description: text(),
  },
  (table) => [
    check(
      'environment_variable_name_chk',
      sql`${table.name} ~ '^[A-Z_][A-Z0-9_]*$'`,
    ),
    unique('environment_variable_name_unq').on(
      table.org_id,
      table.environment_id,
      table.name,
    ),
  ],
);

export const environmentVariableSchema = zodSchemaFactory(
  environmentVariableTable,
);
