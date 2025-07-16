import { boolean, foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { taxPriceIncludeEnum } from '../../accounting/enums.ts';
import { accountTable } from '../../accounting/tables/account.ts';
import { currencyTable } from '../../resource/tables/currency.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { countryTable } from './country.ts';

export const entityTable = internalSchema
  .table(
    'resource_entity',
    {
      ...DEFAULT_COLUMNS,
      active: boolean().notNull().default(true),
      name: text().notNull(),
      parent_id: integer(),
      registration_number: text(),

      currency_id: integer().notNull(),
      country_id: integer().notNull(),
      city: text(),
      address_line1: text(),
      address_line2: text(),
      address_line3: text(),
      postal_code: text(),

      phone: text(),
      email: text(),
      email_domain: text(),
      website: text(),
      tax_id: text(),
      price_include: taxPriceIncludeEnum(),

      income_account_id: integer(),
      expense_account_id: integer(),
    },
    (table) => [
      foreignKey({
        name: 'entity_parent_id_fk',
        columns: [table.parent_id],
        foreignColumns: [table.id],
      }),
      foreignKey({
        name: 'entity_country_id_fk',
        columns: [table.country_id],
        foreignColumns: [countryTable.id],
      }),
      foreignKey({
        name: 'entity_currency_id_fk',
        columns: [table.currency_id],
        foreignColumns: [currencyTable.id],
      }),
      foreignKey({
        name: 'entity_income_account_id_fk',
        columns: [table.income_account_id],
        foreignColumns: [accountTable.id],
      }),
      foreignKey({
        name: 'entity_expense_account_id_fk',
        columns: [table.expense_account_id],
        foreignColumns: [accountTable.id],
      }),
    ],
  )
  .enableRLS();
