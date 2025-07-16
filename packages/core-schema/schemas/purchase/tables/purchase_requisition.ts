import { foreignKey, integer, varchar } from 'drizzle-orm/pg-core';

import { userTable } from '../../resource/tables/user.ts';
import { DEFAULT_COLUMNS, priceCol, timestampCol } from '../../utils.ts';
import {
  purchaseRequisitionPriority,
  purchaseRequisitionStatus,
} from '../enums.ts';
import { purchaseSchema } from '../schema.ts';

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
  ],
);
