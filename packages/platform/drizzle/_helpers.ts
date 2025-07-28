import { type PgTable, timestamp } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';

export const created_at = timestamp('created_at', {
  precision: 3,
  withTimezone: true,
  mode: 'date',
})
  .defaultNow()
  .notNull();

export const updated_at = timestamp('updated_at', {
  precision: 3,
  withTimezone: true,
  mode: 'date',
})
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

export const DEFAULT_COLUMNS = {
  created_at,
  updated_at,
};

export function zodSchemaFactory<T extends PgTable>(table: T) {
  return {
    select: createSelectSchema(table),
    create: createInsertSchema(table),
    update: createUpdateSchema(table),
  };
}
