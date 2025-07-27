import { timestamp } from 'drizzle-orm/pg-core';

export const created_at = timestamp('created_at', {
  precision: 3,
  withTimezone: true,
})
  .defaultNow()
  .notNull();

export const updated_at = timestamp('updated_at', {
  precision: 3,
  withTimezone: true,
})
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

export const DEFAULT_COLUMNS = {
  created_at,
  updated_at,
};
