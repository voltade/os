import { integer, jsonb, text } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { unitsEnum } from '../enums.ts';
import { mrpSchema } from '../schema.ts';

const billOfMaterialsTable = mrpSchema.table('bill_of_material', {
  ...DEFAULT_COLUMNS,
  // to add in reference to product table when created
  product_id: integer().references(() => productTable.id, {
    onDelete: 'cascade',
  }),
  name: text().notNull(),
  description: text().notNull(),
  quantity: integer().notNull(),
  unit: unitsEnum().notNull(),
  operations_order: jsonb().notNull().default({}),
  // TODO: reference to worksheet file in storage
  worksheet: text('worksheet'),
});

export { billOfMaterialsTable };
