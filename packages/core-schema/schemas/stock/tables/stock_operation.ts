import { relations, type SQL, sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  integer,
  pgPolicy,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

import { stockSchema } from '../../schema.ts';
import { DEFAULT_COLUMNS, priceCol, timestampCol } from '../../utils.ts';
import { StockOperationStatus, stockOperationStatusEnum } from '../enums.ts';
import { stockOperationTypeTable } from './stock_operation_type.ts';
import { warehouseTable } from './warehouse.ts';
import { warehouseLocationTable } from './warehouse_location.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'order:' || reference_id)`;
}

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
export const stockOperationTable = stockSchema.table(
  'operation',
  {
    ...DEFAULT_COLUMNS,

    name: text().notNull(),
    description: text(),
    status: stockOperationStatusEnum()
      .notNull()
      .default(StockOperationStatus.DRAFT),

    type_id: integer().notNull(),
    reference_id: varchar('reference_id')
      .notNull()
      .unique()
      .default('PLACE_HOLDER'),

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

    // Stock operation indexes
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

    /**
     * RLS policies for the stock operation table.
     * @see {@link openfga/order.fga}
     */
    pgPolicy('stock_operation_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_order'),
    }),
    pgPolicy('stock_operation_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_order'),
    }),
    pgPolicy('stock_operation_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_order'),
    }),
    pgPolicy('stock_operation_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_order'),
    }),
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
