import { integer } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { unitsEnum } from '../enums.ts';
import { mrpSchema } from '../schema.ts';
import { billOfMaterialsTable } from './bill_of_materials.ts';

const billOfMaterialsLineItemTable = mrpSchema.table(
  'bill_of_materials_line_item',
  {
    ...DEFAULT_COLUMNS,
    // reference to product table
    product_id: integer()
      .notNull()
      .references(() => productTable.id, { onDelete: 'cascade' }),
    quantity: integer().notNull(),
    unit: unitsEnum().notNull(),
    bill_of_materials_id: integer()
      .notNull()
      .references(() => billOfMaterialsTable.id),
  },
);

export { billOfMaterialsLineItemTable };
