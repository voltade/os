import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { entityTable } from '../../resource/tables/entity.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseOrderTable } from './purchase_order.ts';
import { quotationTable } from './quotation.ts';

export const purchaseOrderItemTable = purchaseSchema.table(
  'order_item',
  {
    ...DEFAULT_COLUMNS,
    purchase_order_id: integer().notNull(),
    quotation_item_id: integer().notNull(),
    quantity: integer().notNull(),
    unit_price: priceCol('unit_price').notNull(),
    unit_price_with_tax: priceCol('unit_price_with_tax').notNull(),
    created_by: integer().notNull(),
    updated_by: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.purchase_order_id],
      foreignColumns: [purchaseOrderTable.id],
      name: 'fk_purchase_item_purchase_order',
    }),
    foreignKey({
      columns: [table.quotation_item_id],
      foreignColumns: [quotationTable.id],
      name: 'fk_purchase_item_quotation_item',
    }),
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [entityTable.id],
      name: 'fk_purchase_item_created_by',
    }),
    foreignKey({
      columns: [table.updated_by],
      foreignColumns: [entityTable.id],
      name: 'fk_purchase_item_updated_by',
    }),
  ],
);
