import { relations, sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { warehouseTable } from './warehouse.ts';
import { warehouseLocationTable } from './warehouse_location.ts';

/**
 * This table represents an individual physical unit or batch of a `product` stored in inventory.
 *
 * A `stock_unit` tracks real-world stock — including its quantity, location, status, and
 * optional serial or batch numbers — and serves as the lowest level of traceability in the system.
 *
 * Each entry corresponds to one or more units of a specific product held at a specific warehouse.
 * Depending on the tracking policy of the parent `product`, units may be:
 * - **Serialized**: exactly one unit per record, with a unique `serial_no`.
 * - **Batch-tracked**: multiple units per record, sharing a `batch_no`.
 * - **Untracked**: quantity-based records without serial or batch-level identifiers.
 *
 * This table enables detailed inventory operations, including:
 * - Precise stock counts and per-location availability
 * - Movement tracking (import, transfer, export)
 * - Maintenance of unit status (e.g., available, damaged, reserved)
 * - Historical audit trails and traceability for recalls or quality checks
 *
 * Example entries:
 * - SN12345 of iPhone 16, 256GB, stored in Warehouse A
 * - Batch #LOT-2024-07 of 100 vaccine vials, stored in Warehouse B
 *
 * All physical inventory operations reference this table directly.
 */
export const stockUnitTable = internalSchema.table(
  'stock_unit',
  {
    ...DEFAULT_COLUMNS,

    product_id: integer().notNull(),
    warehouse_id: integer(),
    warehouse_location_id: integer(),

    /**
     * Serial Number (SN) uniquely identifies an individual serialized unit of a product.
     * Typically assigned for products where each item must be tracked separately, such as electronics,
     * medical devices, or high-value equipment.
     */
    serial_no: text(),
    /**
     * Batch or Lot Number groups multiple units produced or received together.
     * It is important for traceability, recalls, and quality control in manufacturing,
     * pharmaceuticals, food, and other industries.
     *
     * Multiple products can share the same batch/lot number.
     */
    batch_no: text(),

    // Audit log
    last_updated_by_id: text(), // TODO: link this to employee
    remarks: jsonb(),
  },
  (table) => [
    foreignKey({
      name: 'stock_unit_product_id_fk',
      columns: [table.product_id],
      foreignColumns: [productTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_unit_warehouse_fk',
      columns: [table.warehouse_id],
      foreignColumns: [warehouseTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'stock_unit_warehouse_location_fk',
      columns: [table.warehouse_location_id],
      foreignColumns: [warehouseLocationTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),

    index('stock_unit_product_idx').on(table.product_id),
    uniqueIndex('stock_unit_serial_idx')
      .on(table.serial_no)
      .where(sql`serial_no IS NOT NULL`),
    index('stock_unit_batch_idx')
      .on(table.batch_no)
      .where(sql`batch_no IS NOT NULL`),
  ],
);

export const stockUnitRelations = relations(stockUnitTable, ({ one }) => ({
  product: one(productTable, {
    fields: [stockUnitTable.product_id],
    references: [productTable.id],
  }),
}));
