import { type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy, varchar } from 'drizzle-orm/pg-core';

import { userTable } from '../../resource/tables/user.ts';
import { DEFAULT_COLUMNS, priceCol, timestampCol } from '../../utils.ts';
import {
  purchaseRequisitionPriority,
  purchaseRequisitionStatus,
} from '../enums.ts';
import { purchaseSchema } from '../schema.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'quotation:' || reference_id)`;
}

export const purchaseRequisitionTable = purchaseSchema.table(
  'requisition',
  {
    ...DEFAULT_COLUMNS,
    reference_id: varchar().notNull().unique().default('PLACE_HOLDER'),

    title: varchar().notNull(),
    description: varchar(),
    priority: purchaseRequisitionPriority().notNull(),
    total_expected_cost: priceCol('total_expected_cost').notNull(),
    rfq_valid_until: timestampCol('rfq_valid_until'),
    status: purchaseRequisitionStatus().notNull(),
    created_by: integer().notNull(),
    updated_by: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [userTable.id],
      name: 'fk_purchase_requisition_created_by',
    }),
    foreignKey({
      columns: [table.updated_by],
      foreignColumns: [userTable.id],
      name: 'fk_purchase_requisition_updated_by',
    }),

    /**
     * RLS policies for the purchase requisition table.
     * @see {@link openfga/quotation.fga}
     */
    pgPolicy('purchase_requisition_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_quotation'),
    }),
    pgPolicy('purchase_requisition_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_quotation'),
    }),
    pgPolicy('purchase_requisition_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_quotation'),
    }),
    pgPolicy('purchase_requisition_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_quotation'),
    }),
  ],
);
