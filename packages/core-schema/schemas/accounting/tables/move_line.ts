import { relations } from 'drizzle-orm';
import { foreignKey, integer, jsonb, numeric, text } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';

export const accountingMoveLineTable = accountingSchema.table(
  'move_line',
  {
    ...DEFAULT_COLUMNS,
    product_id: integer()
      .notNull()
      .references(() => productTable.id),
    quantity: integer().notNull(),
    unit_price: numeric().notNull(),
    subtotal_price: numeric().notNull(), // Excluding tax.
    total_price: numeric().notNull(), // Including tax.
    sequence_number: integer().notNull(),
    // TODO: Triggers should update subtotal_price and total_price,
    // and the parent `move`'s subtotal_amount, total_amount, and tax_amount
    // when the taxes assigned to this move_line (join table), quantity, or unit_price changes.
    name: text(),
    metadata: jsonb(), // e.g. for tracking which education.attendance this invoice line pays for.
  },
  (table) => [
    foreignKey({
      name: 'move_line_product_id_fk',
      columns: [table.product_id],
      foreignColumns: [productTable.id],
    }),
  ],
);

export const accountingMoveLineTableRelations = relations(
  accountingMoveLineTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [accountingMoveLineTable.product_id],
      references: [productTable.id],
    }),
  }),
);
