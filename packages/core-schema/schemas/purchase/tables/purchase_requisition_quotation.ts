import { type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy, primaryKey } from 'drizzle-orm/pg-core';

import { timestampCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';
import { quotationTable } from './quotation.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${purchaseRequisitionTable} req where purchase_requisition_id = req.id and allow('${sql.raw(relation)}', 'quotation:' || req.reference_id))`;
}

export const purchaseRequisitionQuotationTable = purchaseSchema.table(
  'requisition_quotation',
  {
    purchase_requisition_id: integer().notNull(),
    quotation_id: integer().notNull(),
    created_at: timestampCol('created_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'pk_purchase_requisition_quotation',
      columns: [table.purchase_requisition_id, table.quotation_id],
    }),
    foreignKey({
      columns: [table.purchase_requisition_id],
      foreignColumns: [purchaseRequisitionTable.id],
      name: 'fk_purchase_requisition_quotation_requisition',
    }),
    foreignKey({
      columns: [table.quotation_id],
      foreignColumns: [quotationTable.id],
      name: 'fk_purchase_requisition_quotation_quotation',
    }),

    /**
     * RLS policies for the purchase requisition quotation table.
     * @see {@link openfga/quotation.fga}
     */
    pgPolicy('purchase_requisition_quotation_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_quotation'),
    }),
    pgPolicy('purchase_requisition_quotation_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_quotation'),
    }),
    pgPolicy('purchase_requisition_quotation_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_quotation'),
    }),
    pgPolicy('purchase_requisition_quotation_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_quotation'),
    }),
  ],
);
