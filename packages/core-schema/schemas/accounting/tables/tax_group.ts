import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { countryTable } from '../../resource/tables/country.ts';
import { entityTable } from '../../resource/tables/entity.ts';
import { id } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';

export const taxGroupTable = accountingSchema
  .table(
    'tax_group',
    {
      id,
      name: text().notNull(),

      entity_id: integer().notNull(),
      country_id: integer().notNull(),

      tax_payable_account_id: integer(),
      tax_receivable_account_id: integer(),
    },
    (table) => [
      foreignKey({
        name: 'tax_group_entity_id_fk',
        columns: [table.entity_id],
        foreignColumns: [entityTable.id],
      }),
      foreignKey({
        name: 'tax_group_country_id_fk',
        columns: [table.country_id],
        foreignColumns: [countryTable.id],
      }),
    ],
  )
  .enableRLS();
