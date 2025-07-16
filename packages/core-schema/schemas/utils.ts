import { sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  type PgNumericBuilderInitial,
  type PgSequence,
  type PgTimestampBuilderInitial,
  pgSequence,
  timestamp,
} from 'drizzle-orm/pg-core';

/**
 * Creates a numeric column standardized to 2 decimal places for specifying prices.
 */
export function priceCol(name: string): PgNumericBuilderInitial<string> {
  return numeric(name, { precision: 18, scale: 2 });
}

/**
 * Creates a PostgreSQL sequence for generating document IDs.
 *
 * This sequence is configured with:
 * - a fixed increment of 1
 * - a cache of 10 for improved performance
 *
 * Use this when you want a reliable and performant sequence for document-like entities
 * such as invoices, purchase orders, etc.
 *
 * @param name - The name of the sequence to be created in the database.
 * @returns A configured PgSequence object that can be used in Drizzle schema definitions.
 */
export function createDocumentSequence(name: string): PgSequence {
  return pgSequence(name, {
    cache: 10,
    increment: 1,
  });
}

/**
 * Generate a SQL expression for a padded sequence default.
 *
 * @param prefix - The prefix to prepend (e.g., 'P', 'PO')
 * @param sequence - The PgSequence object from pgSequence()
 * @param padLength - Total digits to pad (e.g., 5 → '00001')
 */
export function defaultPaddedSequence(
  prefix: string,
  sequence: PgSequence,
  padLength: number,
) {
  const sequenceName = sequence.seqName;

  return sql`${sql.raw(`'${prefix}' || LPAD(nextval('${sequenceName}')::text, ${padLength}, '0')`)}`;
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
