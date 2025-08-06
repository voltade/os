import { type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${purchaseRequisitionTable} req where purchase_requisition_id = req.id and allow('${sql.raw(relation)}', 'quotation:' || req.reference_id))`;
}

export const purchaseRequisitionItemTable = purchaseSchema.table(
  'requisition_item',
  {
    ...DEFAULT_COLUMNS,
    purchase_requisition_id: integer().notNull(),
    product_id: integer().notNull(),
    quantity: integer().notNull(),
    estimated_cost: priceCol('estimated_cost').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.purchase_requisition_id],
      foreignColumns: [purchaseRequisitionTable.id],
      name: 'fk_purchase_requisition_item_requisition',
    }),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [productTable.id],
      name: 'fk_purchase_requisition_item_item',
    }),

    /**
     * RLS policies for the purchase requisition item table.
     * @see {@link openfga/quotation.fga}
     */
    pgPolicy('purchase_requisition_item_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_quotation'),
    }),
    pgPolicy('purchase_requisition_item_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_quotation'),
    }),
    pgPolicy('purchase_requisition_item_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_quotation'),
    }),
    pgPolicy('purchase_requisition_item_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_quotation'),
    }),
  ],
);
