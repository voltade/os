import { type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy, varchar } from 'drizzle-orm/pg-core';

import { userTable } from '../../resource/tables/user.ts';
import { warehouseTable } from '../../stock/tables/warehouse.ts';
import { DEFAULT_COLUMNS, timestampCol } from '../../utils.ts';
import { PurchaseOrderStatus, purchaseOrderStatus } from '../enums.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';
import { quotationTable } from './quotation.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'order:' || reference_id)`;
}

export const purchaseOrderTable = purchaseSchema.table(
  'order',
  {
    ...DEFAULT_COLUMNS,
    reference_id: varchar().unique().notNull().default('PLACE_HOLDER'),

    purchase_requisition_id: integer().notNull(),
    quotation_id: integer().notNull(),
    warehouse_id: integer().notNull(),
    remarks: varchar(),
    status: purchaseOrderStatus().notNull().default(PurchaseOrderStatus.DRAFT),
    expected_delivery_date: timestampCol('expected_delivery_date').notNull(),
    order_deadline: timestampCol('order_deadline').notNull(),
    created_by: integer().notNull(),
    updated_by: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.warehouse_id],
      foreignColumns: [warehouseTable.id],
      name: 'fk_purchase_order_warehouse',
    }),
    foreignKey({
      columns: [table.purchase_requisition_id],
      foreignColumns: [purchaseRequisitionTable.id],
      name: 'fk_purchase_order_requisition',
    }),
    foreignKey({
      columns: [table.quotation_id],
      foreignColumns: [quotationTable.id],
      name: 'fk_purchase_order_quotation',
    }),
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [userTable.id],
      name: 'fk_purchase_order_created_by',
    }),
    foreignKey({
      columns: [table.updated_by],
      foreignColumns: [userTable.id],
      name: 'fk_purchase_order_updated_by',
    }),

    /**
     * RLS policies for the purchase order table.
     * @see {@link openfga/order.fga}
     */
    pgPolicy('purchase_order_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_order'),
    }),
    pgPolicy('purchase_order_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_order'),
    }),
    pgPolicy('purchase_order_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_order'),
    }),
    pgPolicy('purchase_order_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_order'),
    }),
  ],
);
