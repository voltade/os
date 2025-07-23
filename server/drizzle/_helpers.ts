import { sql } from 'drizzle-orm';
import { text, timestamp } from 'drizzle-orm/pg-core';

export const id = text('id')
  .primaryKey()
  .notNull()
  .default(sql`extensions.nanoid()`);
export const createdAt = timestamp('created_at', {
  precision: 3,
  withTimezone: true,
})
  .defaultNow()
  .notNull();
export const updatedAt = timestamp('updated_at', {
  precision: 3,
  withTimezone: true,
})
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

export const DEFAULT_COLUMNS = {
  id,
  createdAt,
  updatedAt,
};
