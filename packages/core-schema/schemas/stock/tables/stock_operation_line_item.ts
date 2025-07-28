import { isNotNull, relations, type SQL, sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { uomTable } from '../../resource/tables/uom.ts';
import { stockSchema } from '../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import {
  StockOperationLineStatus,
  stockOperationLineStatusEnum,
} from '../enums.ts';
import {
  stockOperationLineTable,
  stockOperationTable,
  stockUnitTable,
} from '../index.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${stockOperationLineTable} sol left join ${stockOperationTable} so on sol.stock_operation_id = so.id where stock_operation_line_id = sol.id and allow('${sql.raw(relation)}', 'order:' || so.reference_id))`;
}

/**
 * This table represents an **individual stock unit** within a stock operation line,
 * providing detailed traceability for serialized or batch-tracked products.
 *
 * Each line item corresponds to a specific `stock_unit` (with serial number or batch number)
 * being moved as part of a stock operation. This enables precise tracking of individual
 * units through their entire lifecycle.
 *
 * **Use cases:**
 * - Tracking individual serialized products (e.g., specific phone with SN12345)
 * - Managing batch-tracked items with expiry dates or quality attributes
 * - Providing audit trails for high-value or regulated products
 * - Supporting recalls and warranty tracking
 *
 * **Key features:**
 * - Each line item references exactly one stock unit.
 * - Tracks the specific quantity of that unit being moved (typically 1 for serialized items).
 * - Records processing status and timestamps for detailed workflow tracking.
 * - Supports unit-specific cost overrides and handling notes.
 * - Maintains source and destination location tracking at the unit level.
 */
export const stockOperationLineItemTable = stockSchema.table(
  'operation_line_item',
  {
    ...DEFAULT_COLUMNS,
    stock_operation_line_id: integer().notNull(),

    // Product Reference
    /**
     * Reference to the specific stock unit in `stock_unit` table being moved.
     * This provides the serial number, batch number, and product details.
     */
    stock_unit_id: integer().notNull(),
    /**
     * External reference ID for linking to source documents
     * (e.g., purchase order line item, sales order line item, etc.).
     */
    reference_id: integer(),

    // Quantity
    /**
     * Total planned quantity for this product in the operation.
     * Typically 1 for serialized items, but may be > 1 for batch items.
     */
    planned_quantity: numeric({
      precision: 18,
      scale: 3,
    })
      .default('1')
      .notNull(),
    /**
     * Actual quantity processed/completed for this line.
     * Updated as line items are processed.
     */
    processed_quantity: numeric({
      precision: 18,
      scale: 3,
    })
      .default('0')
      .notNull(),
    quantity_uom_id: integer(),

    /**
     * Status of this specific line within the operation.
     * Useful for tracking partial completions.
     */
    status: stockOperationLineStatusEnum()
      .default(StockOperationLineStatus.PENDING)
      .notNull(),
    remarks: jsonb(),
  },
  (table) => [
    foreignKey({
      name: 'stock_operation_line_item_line_fk',
      columns: [table.stock_operation_line_id],
      foreignColumns: [stockOperationLineTable.id],
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      name: 'stock_operation_line_item_stock_unit_fk',
      columns: [table.stock_unit_id],
      foreignColumns: [stockUnitTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_operation_line_item_quantity_uom_fk',
      columns: [table.quantity_uom_id],
      foreignColumns: [uomTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),

    // Stock operation line item indexes
    index('stock_operation_line_item_line_idx').on(
      table.stock_operation_line_id,
    ),
    index('stock_operation_line_item_status_idx').on(table.status),
    uniqueIndex('stock_operation_line_item_unique_unit_per_line').on(
      table.stock_operation_line_id,
      table.stock_unit_id,
    ),
    uniqueIndex('stock_operation_line_item_reference_idx')
      .on(table.reference_id)
      .where(isNotNull(table.reference_id)),

    /**
     * RLS policies for the stock operation line item table.
     * @see {@link openfga/order.fga}
     */
    pgPolicy('stock_operation_line_item_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_order'),
    }),
    pgPolicy('stock_operation_line_item_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_order'),
    }),
    pgPolicy('stock_operation_line_item_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_order'),
    }),
    pgPolicy('stock_operation_line_item_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_order'),
    }),
  ],
);

export const stockOperationLineItemRelations = relations(
  stockOperationLineItemTable,
  ({ one }) => ({
    stockOperationLine: one(stockOperationLineTable, {
      fields: [stockOperationLineItemTable.stock_operation_line_id],
      references: [stockOperationLineTable.id],
    }),
    stockUnit: one(stockUnitTable, {
      fields: [stockOperationLineItemTable.stock_unit_id],
      references: [stockUnitTable.id],
    }),
    uom: one(uomTable, {
      fields: [stockOperationLineItemTable.quantity_uom_id],
      references: [uomTable.id],
    }),
  }),
);
