import { boolean, foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { countryTable } from '../../resource/tables/country.ts';
import { id } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';

export const taxTagTable = accountingSchema
  .table(
    'tax_tag',
    {
      id,
      name: text().notNull(),
      negate: boolean().default(false).notNull(),

      country_id: integer(),
    },
    (table) => [
      foreignKey({
        name: 'tab_country_id_fk',
        columns: [table.country_id],
        foreignColumns: [countryTable.id],
      }),
    ],
  )
  .enableRLS();
