import { index, text } from 'drizzle-orm/pg-core';

import type { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { stockSchema } from '../schema.ts';
import type { inventoryTable } from './inventory.ts';
/**
 * A warehouse represents a physical location with a set of {@link inventoryTable inventory}.
 *
 * - Warehouses may be used to track availability of {@link productTable items} and item groups.
 * - Warehouses facilitate the movement (transfer) of items.
 */
export const warehouseTable = stockSchema.table(
  'warehouse',
  {
    ...DEFAULT_COLUMNS,
    name: text().unique().notNull(),
    /**
     * Short code or identifier for the warehouse.
     * @example 'WH1', 'WH2', 'WH-001'
     */
    code: text().notNull().unique(),
    address: text().unique(),
  },
  (table) => [
    index('warehouse_name_idx').on(table.name),
    index('warehouse_code_idx').on(table.code),
  ],
);
