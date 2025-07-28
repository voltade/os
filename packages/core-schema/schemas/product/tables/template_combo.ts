import { relations, type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productSchema } from '../schema.ts';
import { comboTable } from './combo.ts';
import { productTemplateTable } from './product_template.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${productTemplateTable} pt where template_id = pt.id and allow('${sql.raw(relation)}', 'inventory:' || cast(pt.id as varchar)))`;
}

export const templateComboTable = productSchema.table(
  'template_combo',
  {
    ...DEFAULT_COLUMNS,
    combo_id: integer().notNull(),
    template_id: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'template_combo_combo_id_fkey',
      columns: [table.combo_id],
      foreignColumns: [comboTable.id],
    }),
    foreignKey({
      name: 'template_combo_template_id_fkey',
      columns: [table.template_id],
      foreignColumns: [productTemplateTable.id],
    }),

    /**
     * RLS policies for the template combo table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('template_combo_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_products'),
    }),
    pgPolicy('template_combo_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_products'),
    }),
    pgPolicy('template_combo_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_products'),
    }),
    pgPolicy('template_combo_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_products'),
    }),
  ],
);

export const templateComboRelations = relations(
  templateComboTable,
  ({ one }) => ({
    combo: one(comboTable, {
      fields: [templateComboTable.combo_id],
      references: [comboTable.id],
    }),
    template: one(productTemplateTable, {
      fields: [templateComboTable.template_id],
      references: [productTemplateTable.id],
    }),
  }),
);
