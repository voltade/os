import { foreignKey, integer, varchar } from 'drizzle-orm/pg-core';

import { userTable } from '../../resource/tables/user.ts';
import { warehouseTable } from '../../stock/tables/warehouse.ts';
import { DEFAULT_COLUMNS, timestampCol } from '../../utils.ts';
import { purchaseOrderStatus } from '../enums.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';
import { quotationTable } from './quotation.ts';

export const purchaseOrderTable = purchaseSchema.table(
  'order',
  {
    ...DEFAULT_COLUMNS,
    reference_id: varchar().notNull().unique().default('PLACE_HOLDER'),
    purchase_requisition_id: integer().notNull(),
    quotation_id: integer().notNull(),
    warehouse_id: integer().notNull(),
    remarks: varchar(),
    status: purchaseOrderStatus().notNull().default('draft'),
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
  ],
);
