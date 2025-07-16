import { integer, text, timestamp } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productionStatusEnum } from '../enums.ts';
import { mrpSchema } from '../schema.ts';
import { billOfMaterialsTable } from './bill_of_materials.ts';

// a row on production table is one "manufacturing order"
const productionTable = mrpSchema.table('production', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  status: productionStatusEnum().notNull().default('draft'),
  bom_id: integer().references(() => billOfMaterialsTable.id),
  quantity_produced: integer().notNull().default(0),
  extra_cost: integer().notNull().default(0),
  start_date: timestamp(),
  end_date: timestamp(),
});

export { productionTable };
