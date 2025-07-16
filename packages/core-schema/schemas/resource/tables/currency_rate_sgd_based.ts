import { foreignKey, integer, numeric } from 'drizzle-orm/pg-core';

import { resourceSchema } from '../schema.ts';
import { currencyTable } from './currency.ts';

export const currencyRateSGDBasedTable = resourceSchema
  .table(
    'currency_rate_sgd_based',
    {
      id: integer().primaryKey().generatedAlwaysAsIdentity(),
      currency_id: integer().notNull(),
      rate: numeric().notNull(),
    },
    (table) => [
      foreignKey({
        name: 'currency_rate_sgd_based_currency_id_fk',
        columns: [table.currency_id],
        foreignColumns: [currencyTable.id],
      }),
    ],
  )
  .enableRLS();
