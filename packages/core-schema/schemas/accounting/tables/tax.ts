import { type SQL, sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  integer,
  numeric,
  text,
} from 'drizzle-orm/pg-core';

import { countryTable } from '../../resource/tables/country.ts';
import { entityTable } from '../../resource/tables/entity.ts';
import { id } from '../../utils.ts';
import { taxPriceIncludeEnum, taxScopeEnum, taxTypeEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';

export const taxTable = accountingSchema
  .table(
    'tax',
    {
      id,
      active: boolean().notNull().default(true),

      name: text().notNull(),
      type: taxTypeEnum().notNull(),
      scope: taxScopeEnum(),
      amount: numeric().notNull(),

      affect_base_of_subsequent_taxes: boolean().default(false).notNull(),
      base_affected_by_previous_taxes: boolean().default(false).notNull(),

      price_include_override: taxPriceIncludeEnum(),
      price_include: boolean().generatedAlwaysAs(
        (): SQL => sql`
          case
            when ${taxTable.price_include_override} = 'Tax included' then true
            when ${taxTable.price_include_override} = 'Tax excluded' then false
            else null
          end
        `,
      ),

      entity_id: integer(),
      country_id: integer(),

      description: text(),
      invoice_label: text(),
    },
    (table) => [
      foreignKey({
        name: 'tax_entity_id_fk',
        columns: [table.entity_id],
        foreignColumns: [entityTable.id],
      }),
      foreignKey({
        name: 'tax_country_id_fk',
        columns: [table.country_id],
        foreignColumns: [countryTable.id],
      }),
    ],
  )
  .enableRLS();
