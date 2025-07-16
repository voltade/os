import {
  boolean,
  integer,
  numeric,
  type PgNumericBuilderInitial,
  type PgTimestampBuilderInitial,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Creates a numeric column standardized to 2 decimal places for specifying prices.
 */
export function priceCol(name: string): PgNumericBuilderInitial<string> {
  return numeric(name, { precision: 18, scale: 2 });
}

/**
 * Converts an enum object to a PostgreSQL enum type.
 *
 * @param myEnum - The enum object to convert.
 * @returns An array of enum values suitable for PostgreSQL.
 */
// biome-ignore lint/suspicious/noExplicitAny: lazy typing
export function enumToPgEnum<T extends Record<string, any>>(
  myEnum: T,
): [T[keyof T], ...T[keyof T][]] {
  // biome-ignore lint/suspicious/noExplicitAny: lazy typing
  return Object.values(myEnum).map((value: any) => `${value}`) as any;
}

/**
 * Creates a timestamp column with standardized configuration.
 */
export function timestampCol(name: string): PgTimestampBuilderInitial<string> {
  return timestamp(name, {
    precision: 3,
    withTimezone: true,
  });
}

export const id = integer('id').primaryKey().generatedAlwaysAsIdentity();
export const created_at = timestampCol('created_at').defaultNow().notNull();
export const updated_at = timestampCol('updated_at')
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());
export const is_active = boolean('is_active').default(true);

export const DEFAULT_COLUMNS = {
  id,
  created_at,
  updated_at,
  is_active,
};
