import { sql } from 'drizzle-orm';
import { check, foreignKey, integer, numeric, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { contactTable } from '../../resource/tables/contact.ts';
import { currencyTable } from '../../resource/tables/currency.ts';
import { partnerTable } from '../../resource/tables/partner.ts';
import { orderState } from '../enums.ts';

export const orderTable = internalSchema.table(
  'sales_order',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    currency_id: integer().notNull(),
    partner_id: integer(),
    contact_id: integer(),
    name: text().notNull(),
    state: orderState().notNull().default('Draft'),
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
  ],
);
