import { type SQL, sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  integer,
  numeric,
  pgPolicy,
  text,
  varchar,
} from 'drizzle-orm/pg-core';

import { contactTable } from '../../resource/tables/contact.ts';
import { currencyTable } from '../../resource/tables/currency.ts';
import { partnerTable } from '../../resource/tables/partner.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { OrderState, orderState } from '../enums.ts';
import { salesSchema } from '../schema.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'order:' || reference_id)`;
}

export const orderTable = salesSchema.table(
  'order',
  {
    ...DEFAULT_COLUMNS,
    reference_id: varchar().unique().notNull().default('PLACE_HOLDER'),

    currency_id: integer().notNull(),
    partner_id: integer(),
    contact_id: integer(),
    name: text().notNull(),
    state: orderState().notNull().default(OrderState.DRAFT),
    amount_untaxed: numeric().notNull(), // Before tax.
    amount_tax: numeric().notNull(),
    amount_total: numeric().notNull(), // Including tax.
  },
  (table) => [
    check(
      'order_partner_or_contact_id_check',
      sql`num_nonnulls(${table.partner_id}, ${table.contact_id}) > 0`,
    ),
    foreignKey({
      name: 'order_currency_id_fk',
      columns: [table.currency_id],
      foreignColumns: [currencyTable.id],
    }),
    foreignKey({
      name: 'order_partner_id_fk',
      columns: [table.partner_id],
      foreignColumns: [partnerTable.id],
    }),
    foreignKey({
      name: 'order_contact_id_fk',
      columns: [table.contact_id],
      foreignColumns: [contactTable.id],
    }),

    /**
     * RLS policies for the sales order table.
     * @see {@link openfga/order.fga}
     */
    pgPolicy('sales_order_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_order'),
    }),
    pgPolicy('sales_order_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_order'),
    }),
    pgPolicy('sales_order_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_order'),
    }),
    pgPolicy('sales_order_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_order'),
    }),
  ],
);
