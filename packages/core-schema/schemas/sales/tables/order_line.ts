import { foreignKey, integer, numeric, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { comboProductTable } from '../../product/tables/combo_product.ts';
import { productTable } from '../../product/tables/product.ts';
import { id } from '../../utils.ts';
import { orderLineType } from '../enums.ts';
import { orderTable } from './order.ts';

export const orderLineTable = internalSchema.table(
  'sales_order_line',
  {
    id,
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
  ],
);
