import { isNotNull, sql } from 'drizzle-orm';
import { pgSchema, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

const vaultSchema = pgSchema('vault');

export const vaultSecrets = vaultSchema.table(
  'secrets',
  {
    id: uuid('id').primaryKey().notNull().default(sql`gen_random_uuid()`),
    name: text('name'),
    secret: text('secret'),
  },
  (table) => [
    uniqueIndex('secrets_name_idx').on(table.name).where(isNotNull(table.name)),
  ],
);
