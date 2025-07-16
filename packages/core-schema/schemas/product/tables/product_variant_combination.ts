import { relations } from 'drizzle-orm';
import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productSchema } from '../schema.ts';
import { productAttributeTable } from './attribute.ts';
import { productTable } from './product.ts';

export const productVariantCombinationTable = productSchema.table(
  'variant_combination',
  {
    ...DEFAULT_COLUMNS,
    product_product_id: integer().notNull(),
    product_product_attribute_value_id: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'product_variant_combination_product_product_id_fk',
      columns: [table.product_product_id],
      foreignColumns: [productTable.id],
    }),
    foreignKey({
      name: 'product_variant_combination_product_product_attribute_value_id_fk',
      columns: [table.product_product_attribute_value_id],
      foreignColumns: [productAttributeTable.id],
    }),
  ],
);

export const productVariantCombinationRelations = relations(
  productVariantCombinationTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productVariantCombinationTable.product_product_id],
      references: [productTable.id],
    }),
    productAttributeValue: one(productAttributeTable, {
      fields: [
        productVariantCombinationTable.product_product_attribute_value_id,
      ],
      references: [productAttributeTable.id],
    }),
  }),
);
