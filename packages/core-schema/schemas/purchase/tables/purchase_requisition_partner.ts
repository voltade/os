import { foreignKey, integer, primaryKey } from 'drizzle-orm/pg-core';

import { partnerTable } from '../../resource/tables/partner.ts';
import { timestampCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';

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
  ],
);
