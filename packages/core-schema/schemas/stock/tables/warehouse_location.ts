import {
  boolean,
  foreignKey,
  index,
  integer,
  numeric,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

import { stockSchema } from '../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { warehouseTable } from './warehouse.ts';

/**
 * A warehouse location represents a specific area within a {@link warehouseTable warehouse}.
 * It can be used to track the storage of items in different sections or shelves.
 */
export const warehouseLocationTable = stockSchema.table(
  'warehouse_location',
  {
    ...DEFAULT_COLUMNS,
    warehouse_id: integer().notNull(),
    name: text().notNull(),
    description: text(),
    capacity: numeric('capacity'),

    // Details about the physical location of this warehouse location
    floor: text(),
    section: text(),
    aisle: text(),
    shelf: text(),

    // Details about the storage capabilities of this location
    has_refrigeration: boolean().default(false),
    temperature_controlled: boolean().default(false),
  },
  (table) => [
    foreignKey({
      name: 'warehouse_loc_id_fk',
      columns: [table.warehouse_id],
      foreignColumns: [warehouseTable.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    index('warehouse_locations_idx').on(table.warehouse_id),
  ],
);

export const warehouseLocationRelations = relations(
  warehouseLocationTable,
  ({ one }) => ({
    warehouse: one(warehouseTable, {
      fields: [warehouseLocationTable.warehouse_id],
      references: [warehouseTable.id],
    }),
  }),
);
