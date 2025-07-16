import { relations, sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { uomTable } from '../../resource/tables/uom.ts';
import { stockSchema } from '../../schema.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import {
  StockOperationLineStatus,
  stockOperationLineStatusEnum,
} from '../enums.ts';
import { stockOperationTable } from './stock_operation.ts';

/**
 * This table represents a **single line** within a stock operation, tracking the movement
 * of a specific product as part of a broader stock operation.
 *
 * Each line specifies the overall quantity of a product being moved in the operation.
 * For serialized or batch-tracked products, the actual individual units are tracked
 * in the related `stock_operation_line_item` table.
 *
 * **Use cases:**
 * - Aggregating quantities of products in a stock operation (e.g., 100 units of SKU X)
 * - Providing summary-level cost and pricing information
 * - Enabling bulk operations while maintaining detailed traceability through line items
 *
 * **Key features:**
 * - Supports quantity-based inventory at the product level.
 * - Serves as parent record for individual stock unit movements.
 * - Allows line-level override of cost price for financial accuracy.
 * - Enables per-line remarks for special handling or audit trails.
 */
export const stockOperationLineTable = stockSchema.table(
  'operation_line',
  {
    ...DEFAULT_COLUMNS,
    stock_operation_id: integer().notNull(),

    // Product Reference
    /**
     * Reference to the product being moved in this operation line.
     * This links to the `product` table, which contains product details.
     */
    product_id: integer().notNull(),
    /**
     * External reference ID for linking to source documents
     * (e.g., purchase order line item, sales order line item, etc.).
     */
    reference_id: integer(),

    // Quantity
    /**
     * Total planned quantity for this product in the operation.
     * This represents the aggregate of all individual units in the line items.
     */
    planned_quantity: numeric({
      precision: 18,
      scale: 3,
    }).notNull(),
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

    // Financials
    unit_cost_price: priceCol('unit_cost_price'),
    subtotal_cost: priceCol('subtotal_cost'),

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
      name: 'stock_operation_line_stock_operation_fk',
      columns: [table.stock_operation_id],
      foreignColumns: [stockOperationTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_operation_line_product_fk',
      columns: [table.product_id],
      foreignColumns: [productTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_operation_line_quantity_uom_fk',
      columns: [table.quantity_uom_id],
      foreignColumns: [uomTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),

    index('stock_operation_line_stock_operation_idx').on(
      table.stock_operation_id,
    ),
    index('stock_operation_line_status_idx').on(table.status),
    uniqueIndex('stock_operation_line_product_idx').on(
      table.stock_operation_id,
      table.product_id,
    ),
    uniqueIndex('stock_operation_line_reference_idx')
      .on(table.reference_id)
      .where(sql`reference_id IS NOT NULL`),
  ],
);

export const stockOperationLineRelations = relations(
  stockOperationLineTable,
  ({ one }) => ({
    operation: one(stockOperationTable, {
      fields: [stockOperationLineTable.stock_operation_id],
      references: [stockOperationTable.id],
    }),
    product: one(productTable, {
      fields: [stockOperationLineTable.product_id],
      references: [productTable.id],
    }),
    uom: one(uomTable, {
      fields: [stockOperationLineTable.quantity_uom_id],
      references: [uomTable.id],
    }),
  }),
);
