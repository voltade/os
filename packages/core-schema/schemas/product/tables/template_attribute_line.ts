import { relations, type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productSchema } from '../schema.ts';
import { productAttributeTable } from './attribute.ts';
import { productTemplateTable } from './product_template.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${productTemplateTable} pt where product_template_id = pt.id and allow('${sql.raw(relation)}', 'inventory:' || cast(pt.id as varchar)))`;
}

export const productTemplateAttributeLineTable = productSchema.table(
  'template_attribute_line',
  {
    ...DEFAULT_COLUMNS,
    product_template_id: integer().notNull(),
    attribute_id: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'product_template_attribute_line_product_template_id_fkey',
      columns: [table.product_template_id],
      foreignColumns: [productTemplateTable.id],
    }),
    foreignKey({
      name: 'product_template_attribute_line_attribute_id_fkey',
      columns: [table.attribute_id],
      foreignColumns: [productAttributeTable.id],
    }),

    /**
     * RLS policies for the template attribute line table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('template_attribute_line_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_products'),
    }),
    pgPolicy('template_attribute_line_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_products'),
    }),
    pgPolicy('template_attribute_line_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_products'),
    }),
    pgPolicy('template_attribute_line_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_products'),
    }),
  ],
);

export const productTemplateAttributeLineRelations = relations(
  productTemplateAttributeLineTable,
  ({ one }) => ({
    productTemplate: one(productTemplateTable, {
      fields: [productTemplateAttributeLineTable.product_template_id],
      references: [productTemplateTable.id],
    }),
    attribute: one(productAttributeTable, {
      fields: [productTemplateAttributeLineTable.attribute_id],
      references: [productAttributeTable.id],
    }),
  }),
);
