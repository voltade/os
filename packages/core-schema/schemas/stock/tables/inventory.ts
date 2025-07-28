import { type SQL, sql } from 'drizzle-orm';
import {
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { productTable } from '../../product/tables/product.ts';
import { stockSchema } from '../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { stockUnitTable } from './stock_unit.ts';
import { warehouseTable } from './warehouse.ts';
import { warehouseLocationTable } from './warehouse_location.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'inventory:' || cast(product_id as varchar))`;
}

/**
 * The inventory tracks {@link productTable products} and/or {@link stockUnitTable stock units}
 * in the respective {@link warehouseTable warehouses} with detailed quantity breakdowns.
 *
 * Each row tracks different types of quantities for a product at a specific warehouse:
 * - **On-hand**: Physical stock available for allocation
 * - **Reserved**: Stock allocated for specific operations but not yet moved
 * - **Incoming**: Stock expected to arrive from pending operations
 * - **Total**: Computed sum of all quantity types
 */
export const inventoryTable = stockSchema.table(
  'inventory',
  {
    ...DEFAULT_COLUMNS,

    // Track either a product or a specific stock unit
    product_id: integer().notNull(),
    stock_unit_id: integer(),

    // Quantity breakdowns
    /**
     * On-hand quantity: Physical stock currently available for use.
     * This represents actual inventory that can be allocated for new orders.
     */
    on_hand_quantity: numeric({ precision: 18, scale: 3 })
      .notNull()
      .default('0'),
    /**
     * Reserved quantity: Stock that has been allocated for specific operations but not yet moved.
     * This includes stock reserved for pending sales orders, transfers, or other operations.
     */
    reserved_quantity: numeric({ precision: 18, scale: 3 })
      .notNull()
      .default('0'),
    /**
     * Incoming quantity: Stock that is expected to arrive at this location.
     * This includes stock from pending purchase orders, transfers in, or manufacturing operations.
     */
    incoming_quantity: numeric({ precision: 18, scale: 3 })
      .notNull()
      .default('0'),
    /**
     * Total quantity: Computed total of all quantity types for reporting purposes.
     * Formula: on_hand + reserved + incoming
     */
    total_quantity: numeric({
      precision: 18,
      scale: 3,
    }).generatedAlwaysAs(
      sql`(on_hand_quantity + reserved_quantity + incoming_quantity)`,
    ),

    // Reference to the warehouse / specific location where this inventory is stored
    warehouse_id: integer().notNull(),
    warehouse_location_id: integer(),

    // Audit log
    last_updated_by_id: text(), // TODO: link this to employee
    remarks: jsonb(),
  },
  (table) => [
    foreignKey({
      name: 'inventory_product_fk',
      columns: [table.product_id],
      foreignColumns: [productTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'inventory_stock_unit_fk',
      columns: [table.stock_unit_id],
      foreignColumns: [stockUnitTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'inventory_warehouse_fk',
      columns: [table.warehouse_id],
      foreignColumns: [warehouseTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    foreignKey({
      name: 'inventory_warehouse_location_fk',
      columns: [table.warehouse_location_id],
      foreignColumns: [warehouseLocationTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),

    // Inventory indexes
    index('inventory_warehouse_idx').on(table.warehouse_id),
    index('inventory_composite_idx').on(table.warehouse_id, table.product_id),

    /**
     * RLS policies for the inventory table.
     * @see {@link openfga/inventory.fga}
     */
    pgPolicy('inventory_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_stock'),
    }),
    pgPolicy('inventory_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_edit_stock'),
    }),
    pgPolicy('inventory_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_stock'),
    }),
    pgPolicy('inventory_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_edit_stock'),
    }),
  ],
);

export const inventoryRelations = relations(inventoryTable, ({ one }) => ({
  warehouse: one(warehouseTable, {
    fields: [inventoryTable.warehouse_id],
    references: [warehouseTable.id],
  }),
  warehouseLocations: one(warehouseLocationTable, {
    fields: [inventoryTable.warehouse_location_id],
    references: [warehouseLocationTable.id],
  }),
  product: one(productTable, {
    fields: [inventoryTable.product_id],
    references: [productTable.id],
  }),
  stockUnit: one(stockUnitTable, {
    fields: [inventoryTable.stock_unit_id],
    references: [stockUnitTable.id],
  }),
}));
