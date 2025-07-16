import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { currencyTable } from '../../resource/tables/currency.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const partnerTable = internalSchema
  .table(
    'resource_partner',
    {
      ...DEFAULT_COLUMNS,
      name: text().notNull(),
      parent_id: integer(),
      address_line1: text(),
      address_line2: text(),
      address_line3: text(),
      postal_code: text(),
      city: text(),
      country: text(),
      phone: text(),
      email: text(),
      email_domain: text(),
      website: text(),
      tax_id: text(),
      registration_number: text(),
      currency_id: integer(),
    },
    (table) => [
      foreignKey({
        name: 'partner_currency_id_fk',
        columns: [table.currency_id],
        foreignColumns: [currencyTable.id],
      }),
      foreignKey({
        name: 'partner_parent_id_fk',
        columns: [table.parent_id],
        foreignColumns: [table.id],
      }),
    ],
  )
  .enableRLS();
