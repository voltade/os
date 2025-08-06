import { foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';
import { type SQL, sql } from 'drizzle-orm/sql/sql';

import { entityTable } from '../../resource/tables/entity.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { purchaseOrderTable } from './purchase_order.ts';
import { quotationTable } from './quotation.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${purchaseOrderTable} po where purchase_order_id = po.id and allow('${sql.raw(relation)}', 'order:' || po.reference_id))`;
}

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

    /**
     * RLS policies for the purchase order item table.
     * @see {@link openfga/order.fga}
     */
    pgPolicy('purchase_order_item_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_order'),
    }),
    pgPolicy('purchase_order_item_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_order'),
    }),
    pgPolicy('purchase_order_item_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_order'),
    }),
    pgPolicy('purchase_order_item_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_order'),
    }),
  ],
);
