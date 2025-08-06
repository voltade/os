import { type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy, primaryKey } from 'drizzle-orm/pg-core';

import { partnerTable } from '../../resource/tables/partner.ts';
import { timestampCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${purchaseRequisitionTable} req where purchase_requisition_id = req.id and allow('${sql.raw(relation)}', 'quotation:' || req.reference_id))`;
}

export const purchaseRequisitionPartnerTable = purchaseSchema.table(
  'requisition_partner',
  {
    purchase_requisition_id: integer().notNull(),
    supplier_id: integer().notNull(),
    created_at: timestampCol('created_at').defaultNow(),
  },
  (table) => [
    primaryKey({
      name: 'pk_purchase_requisition_partner',
      columns: [table.purchase_requisition_id, table.supplier_id],
    }),
    foreignKey({
      columns: [table.purchase_requisition_id],
      foreignColumns: [purchaseRequisitionTable.id],
      name: 'fk_purchase_requisition_partner_requisition',
    }),
    foreignKey({
      columns: [table.supplier_id],
      foreignColumns: [partnerTable.id],
      name: 'fk_purchase_requisition_partner_partner',
    }),

    /**
     * RLS policies for the purchase requisition partner table.
     * @see {@link openfga/quotation.fga}
     */
    pgPolicy('purchase_requisition_partner_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_quotation'),
    }),
    pgPolicy('purchase_requisition_partner_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_quotation'),
    }),
    pgPolicy('purchase_requisition_partner_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_quotation'),
    }),
    pgPolicy('purchase_requisition_partner_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_quotation'),
    }),
  ],
);
