import { relations, type SQL, sql } from 'drizzle-orm';
import {
  foreignKey,
  integer,
  numeric,
  pgPolicy,
  text,
} from 'drizzle-orm/pg-core';

import { comboProductTable } from '../../product/tables/combo_product.ts';
import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { orderLineType } from '../enums.ts';
import { salesSchema } from '../schema.ts';
import { orderTable } from './order.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${orderTable} so where order_id = so.id and allow('${sql.raw(relation)}', 'order:' || so.reference_id))`;
}

export const orderLineTable = salesSchema.table(
  'order_line',
  {
    ...DEFAULT_COLUMNS,
    order_id: integer().notNull(),
    parent_order_line_id: integer(), // For nested lines, such as for products in a Configurable Bundle.
    sequence: integer().notNull(),
    product_id: integer(),
    combo_product_id: integer(),

    description: text(),
    // If the order line type is Product, this is the product's (possibly customized) description.
    // The product's name is not customizable (it follows the product template's name).
    // If the order line type is Section or Note, this is the text rendered.

    type: orderLineType().notNull().default('Product'),
    quantity: numeric(),
    unit_price: numeric(),
    price_subtotal: numeric(), // Before tax.
    price_tax: numeric(),
    price_total: numeric(), // Including tax.
  },
  (table) => [
    foreignKey({
      name: 'order_line_order_id_fk',
      columns: [table.order_id],
      foreignColumns: [orderTable.id],
    }),
    foreignKey({
      name: 'order_line_parent_order_line_id_fk',
      columns: [table.parent_order_line_id],
      foreignColumns: [table.id],
    }),
    foreignKey({
      name: 'order_line_product_id_fk',
      columns: [table.product_id],
      foreignColumns: [productTable.id],
    }),
    foreignKey({
      name: 'order_line_combo_product_id_fk',
      columns: [table.combo_product_id],
      foreignColumns: [comboProductTable.id],
    }),

    /**
     * RLS policies for the order line table.
     * @see {@link openfga/order.fga}
     */
    pgPolicy('order_line_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_order'),
    }),
    pgPolicy('order_line_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_order'),
    }),
    pgPolicy('order_line_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_order'),
    }),
    pgPolicy('order_line_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_order'),
    }),
  ],
);

export const orderLineRelations = relations(orderLineTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderLineTable.order_id],
    references: [orderTable.id],
  }),
}));
