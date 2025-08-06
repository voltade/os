import { type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { quotationTable } from './quotation.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${quotationTable} quot where quotation_id = quot.id and allow('${sql.raw(relation)}', 'quotation:' || quot.reference_id))`;
}

export const quotationItemTable = purchaseSchema.table(
  'quotation_item',
  {
    ...DEFAULT_COLUMNS,
    quotation_id: integer().notNull(),
    product_id: integer().notNull(),
    unit_price: priceCol('unit_price').notNull(),
    unit_price_with_tax: priceCol('unit_price_with_tax').notNull(),
    moq: integer().notNull(), // minimum order quantity
  },
  (table) => [
    foreignKey({
      columns: [table.quotation_id],
      foreignColumns: [quotationTable.id],
      name: 'fk_quotation_item_quotation',
    }),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [productTable.id],
      name: 'fk_quotation_item_item',
    }),

    /**
     * RLS policies for the purchase quotation item table.
     * @see {@link openfga/quotation.fga}
     */
    pgPolicy('purchase_quotation_item_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_quotation'),
    }),
    pgPolicy('purchase_quotation_item_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_quotation'),
    }),
    pgPolicy('purchase_quotation_item_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_quotation'),
    }),
    pgPolicy('purchase_quotation_item_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_quotation'),
    }),
  ],
);
