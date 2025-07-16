import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { resourceSchema } from '../schema.ts';

export const currencyTable = resourceSchema
  .table('currency', {
    ...DEFAULT_COLUMNS,
    name: text().notNull().unique(),
    full_name: text().notNull(),
    symbol: text().notNull(),
    decimal_places: integer().notNull().default(2),
  })
  .enableRLS();
