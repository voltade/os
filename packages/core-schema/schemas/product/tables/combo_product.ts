import { relations } from 'drizzle-orm';
import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { productSchema } from '../schema.ts';
import { comboTable } from './combo.ts';
import { productTable } from './product.ts';

export const comboProductTable = productSchema.table(
  'combo_product',
  {
    ...DEFAULT_COLUMNS,
    combo_id: integer().notNull(),
    product_id: integer().notNull(),
    extra_price: priceCol('extra_price').default('0').notNull(),
  },
  (table) => [
    foreignKey({
      name: 'combo_product_combo_id_fkey',
      columns: [table.combo_id],
      foreignColumns: [comboTable.id],
    }),
    foreignKey({
      name: 'combo_product_product_id_fkey',
      columns: [table.product_id],
      foreignColumns: [productTable.id],
    }),
  ],
);

export const comboItemRelations = relations(comboProductTable, ({ one }) => ({
  combo: one(comboTable, {
    fields: [comboProductTable.combo_id],
    references: [comboTable.id],
  }),
  product: one(productTable, {
    fields: [comboProductTable.product_id],
    references: [productTable.id],
  }),
}));
