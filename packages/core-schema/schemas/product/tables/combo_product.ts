import { relations, type SQL, sql } from 'drizzle-orm';
import {
  foreignKey,
  integer,
  pgPolicy,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { comboTable, productTable, productTemplateTable } from '../index.ts';
import { productSchema } from '../schema.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${productTable} p left join ${productTemplateTable} pt on p.template_id = pt.id where product_id = p.id and allow('${sql.raw(relation)}', 'inventory:' || cast(pt.id as varchar)))`;
}

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

    // Combo product indexes
    uniqueIndex('combo_product_combo_id_product_id_key').on(
      table.combo_id,
      table.product_id,
    ),

    /**
     * RLS policies for the combo product table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('combo_product_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_products'),
    }),
    pgPolicy('combo_product_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_products'),
    }),
    pgPolicy('combo_product_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_products'),
    }),
    pgPolicy('combo_product_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_products'),
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
