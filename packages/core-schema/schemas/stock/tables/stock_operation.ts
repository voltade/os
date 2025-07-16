import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS, priceCol, timestampCol } from '../../utils.ts';
import { StockOperationStatus, stockOperationStatusEnum } from '../enums.ts';
import { stockOperationTypeTable } from './stock_operation_type.ts';
import { warehouseTable } from './warehouse.ts';
import { warehouseLocationTable } from './warehouse_location.ts';

/**
 * This table represents a single **stock movement operation**, such as an import (receiving),
 * internal transfer (between locations), or export (delivery, sales, disposal).
 *
 * A stock operation groups one or more `stock_operation_line` records and defines the overall context
 * of the movement — including source/destination locations, timing, logistics, and financials.
 *
 * Stock operations are used for all types of inventory workflows, including:
 * - Receiving goods from a supplier
 * - Transferring stock between warehouses or storage areas
 * - Delivering items to customers
 * - Returning defective products to vendors
 *
 * Key features:
 * - Supports detailed tracking of when the move was planned, reserved, started, and completed.
 * - Handles both warehouse-level and sub-location-level movements.
 * - Can optionally require delivery logistics (e.g., vehicle dispatch).
 * - Includes optional financial fields such as cost price for integration with accounting or valuation.
 *
 * Each type of operation has a pre-defined set of statuses to manage its lifecycle.
 */
export const stockOperationTable = internalSchema.table(
  'stock_operation',
  {
    ...DEFAULT_COLUMNS,

    name: text().notNull(),
    description: text(),
    status: stockOperationStatusEnum()
      .notNull()
      .default(StockOperationStatus.DRAFT),

    type_id: integer().notNull(),
    reference_id: text(),

    // Date fields
    reserved_at: timestampCol('reserved_at'),
    started_at: timestampCol('started_at'),
    completed_at: timestampCol('completed_at'),
    expected_completion_at: timestampCol('expected_completion_at'),
    deadline: timestampCol('deadline'),

    // Source and destination locations
    source_warehouse_id: integer(),
    source_location_id: integer(),
    destination_warehouse_id: integer(),
    destination_location_id: integer(),

    // Logistics
    // TODO: expand this feature to include delivery management
    delivery_required: boolean().notNull().default(false),

    // Financials
    cost_price: priceCol('cost_price'),
  },
  (table) => [
    foreignKey({
      name: 'stock_operation_type_fk',
      columns: [table.type_id],
      foreignColumns: [stockOperationTypeTable.id],
    }),
    foreignKey({
      name: 'stock_operation_src_warehouse_fk',
      columns: [table.source_warehouse_id],
      foreignColumns: [warehouseTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_operation_src_warehouse_location_fk',
      columns: [table.source_location_id],
      foreignColumns: [warehouseLocationTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_operation_dest_warehouse_fk',
      columns: [table.destination_warehouse_id],
      foreignColumns: [warehouseTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_operation_dest_warehouse_location_fk',
      columns: [table.destination_location_id],
      foreignColumns: [warehouseLocationTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),

    index('stock_operation_type_idx').on(table.type_id),
    index('stock_operation_status_idx').on(table.status),
    index('stock_operation_src_warehouse_idx')
      .on(table.source_warehouse_id)
      .where(sql`source_warehouse_id IS NOT NULL`),
    index('stock_operation_src_location_idx')
      .on(table.source_location_id)
      .where(sql`source_location_id IS NOT NULL`),
    index('stock_operation_dest_warehouse_idx')
      .on(table.destination_warehouse_id)
      .where(sql`destination_warehouse_id IS NOT NULL`),
    index('stock_operation_dest_location_idx')
      .on(table.destination_location_id)
      .where(sql`destination_location_id IS NOT NULL`),
    uniqueIndex('stock_operation_reference_id_idx')
      .on(table.reference_id)
      .where(sql`reference_id IS NOT NULL`),
  ],
);

export const stockOperationRelations = relations(
  stockOperationTable,
  ({ one }) => ({
    type: one(stockOperationTypeTable, {
      fields: [stockOperationTable.type_id],
      references: [stockOperationTypeTable.id],
    }),
    sourceWarehouse: one(warehouseTable, {
      fields: [stockOperationTable.source_warehouse_id],
      references: [warehouseTable.id],
    }),
    sourceLocation: one(warehouseLocationTable, {
      fields: [stockOperationTable.source_location_id],
      references: [warehouseLocationTable.id],
    }),
    destinationWarehouse: one(warehouseTable, {
      fields: [stockOperationTable.destination_warehouse_id],
      references: [warehouseTable.id],
    }),
    destinationLocation: one(warehouseLocationTable, {
      fields: [stockOperationTable.destination_location_id],
      references: [warehouseLocationTable.id],
    }),
  }),
);
