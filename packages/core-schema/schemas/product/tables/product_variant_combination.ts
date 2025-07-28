import { relations, type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productTable, productTemplateTable } from '../index.ts';
import { productSchema } from '../schema.ts';
import { productAttributeTable } from './attribute.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${productTable} p left join ${productTemplateTable} pt on p.template_id = pt.id where product_product_id = p.id and allow('${sql.raw(relation)}', 'inventory:' || cast(pt.id as varchar)))`;
}

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

    /**
     * RLS policies for the product variant combination table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('product_variant_combination_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_products'),
    }),
    pgPolicy('product_variant_combination_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_products'),
    }),
    pgPolicy('product_variant_combination_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_products'),
    }),
    pgPolicy('product_variant_combination_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_products'),
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
