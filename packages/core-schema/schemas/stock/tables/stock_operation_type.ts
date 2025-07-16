import { text } from 'drizzle-orm/pg-core';

import { stockSchema } from '../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { stockOperationTypeEnum } from '../enums.ts';

/**
 * The `stock_operation_type` table defines the types of stock operations
 * that can be performed in the inventory management system.
 */
export const stockOperationTypeTable = stockSchema.table('operation_type', {
  ...DEFAULT_COLUMNS,
  name: stockOperationTypeEnum().notNull().unique(),
  code: text().notNull().unique(),
  description: text(),
});
