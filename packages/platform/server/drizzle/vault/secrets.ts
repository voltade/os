import { isNotNull, sql } from 'drizzle-orm';
import { pgSchema, text, uniqueIndex } from 'drizzle-orm/pg-core';

export const vaultSchema = pgSchema('vault');

export const vaultSecrets = vaultSchema.table(
  'secrets',
  {
    id: text('id').primaryKey().notNull().default(sql`extensions.nanoid()`),
    name: text('name'),
    secret: text('secret'),
  },
  (table) => [
    uniqueIndex('secrets_name_idx').on(table.name).where(isNotNull(table.name)),
  ],
);
