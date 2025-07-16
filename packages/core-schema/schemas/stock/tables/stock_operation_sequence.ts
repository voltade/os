import { relations } from 'drizzle-orm';
import { foreignKey, integer, uniqueIndex } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { stockOperationTypeTable } from './stock_operation_type.ts';
import { warehouseTable } from './warehouse.ts';

/**
 * This table is used to track generated sequence numbers for stock operations.
 *
 * A separate trigger is used to generate the sequence numbers
 * based on the `warehouseId` and `moveType`.
 */
export const stockOperationSequenceTable = internalSchema.table(
  'stock_operation_sequence',
  {
    ...DEFAULT_COLUMNS,
    warehouse_id: integer().notNull(),
    type_id: integer().notNull(),
    sequence_number: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.warehouse_id],
      foreignColumns: [warehouseTable.id],
    }),
    foreignKey({
      name: 'stock_operation_type_fk',
      columns: [table.type_id],
      foreignColumns: [stockOperationTypeTable.id],
    }),
    uniqueIndex('stock_operation_sequence_idx').on(
      table.warehouse_id,
      table.type_id,
    ),
  ],
);

export const stockOperationSequenceRelations = relations(
  stockOperationSequenceTable,
  ({ one }) => ({
    warehouse: one(warehouseTable, {
      fields: [stockOperationSequenceTable.warehouse_id],
      references: [warehouseTable.id],
    }),
    type: one(stockOperationTypeTable, {
      fields: [stockOperationSequenceTable.type_id],
      references: [stockOperationTypeTable.id],
    }),
  }),
);
