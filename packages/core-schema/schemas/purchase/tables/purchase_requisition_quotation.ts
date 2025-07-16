import { foreignKey, integer, primaryKey } from 'drizzle-orm/pg-core';

import { timestampCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';
import { quotationTable } from './quotation.ts';

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
  ],
);
