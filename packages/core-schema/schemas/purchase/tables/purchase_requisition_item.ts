import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseRequisitionTable } from './purchase_requisition.ts';

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
  ],
);
