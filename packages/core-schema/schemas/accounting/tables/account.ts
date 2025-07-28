import { relations } from 'drizzle-orm';
import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { currencyTable } from '../../resource/tables/currency.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { accountCategoryEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';

export const accountTable = accountingSchema
  .table(
    'account',
    {
      ...DEFAULT_COLUMNS,
      code: text().notNull().unique(),
      name: text().notNull(),
      category: accountCategoryEnum(),
      currency_id: integer(),
    },
    (table) => [
      foreignKey({
        name: 'account_currency_id_fk',
        columns: [table.currency_id],
        foreignColumns: [currencyTable.id],
      }),
    ],
  )
  .enableRLS();

export const accountRelations = relations(accountTable, ({ one }) => ({
  currency: one(currencyTable, {
    fields: [accountTable.currency_id],
    references: [currencyTable.id],
  }),
}));
