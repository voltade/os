import { integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { unitsEnum } from '../enums.ts';
import { productionTable } from './production.ts';

const productionLineItemTable = internalSchema.table(
  'mrp_production_line_item',
  {
    ...DEFAULT_COLUMNS,
    // reference to product table
    // optionally references an existing product
    product_id: integer().references(() => productTable.id),
    name: text().notNull(),
    quantity: integer().notNull(),
    unit: unitsEnum().notNull(),
    production_id: integer()
      .notNull()
      .references(() => productionTable.id),
  },
);

export { productionLineItemTable };
