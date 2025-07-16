import { relations } from 'drizzle-orm';
import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productSchema } from '../schema.ts';
import { productAttributeTable } from './attribute.ts';

export const productAttributeValueTable = productSchema.table(
  'attribute_value',
  {
    ...DEFAULT_COLUMNS,
    name: text().notNull(),
    product_attribute_id: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'product_attribute_value_product_attribute_id_fk',
      columns: [table.product_attribute_id],
      foreignColumns: [productAttributeTable.id],
    }),
  ],
);

export const productAttributeValueRelations = relations(
  productAttributeValueTable,
  ({ one }) => ({
    productAttribute: one(productAttributeTable, {
      fields: [productAttributeValueTable.product_attribute_id],
      references: [productAttributeTable.id],
    }),
  }),
);
