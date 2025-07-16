import { integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const currencyTable = internalSchema
  .table('resource_currency', {
    ...DEFAULT_COLUMNS,
    name: text().notNull().unique(),
    full_name: text().notNull(),
    symbol: text().notNull(),
    decimal_places: integer().notNull().default(2),
  })
  .enableRLS();
