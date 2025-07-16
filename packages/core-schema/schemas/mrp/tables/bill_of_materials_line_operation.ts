import { boolean, integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { mrpSchema } from '../schema.ts';
import { billOfMaterialsTable } from './bill_of_materials.ts';
import { workcenterTable } from './workcenter.ts';

const billOfMaterialsLineOperationTable = mrpSchema.table(
  'bill_of_materials_line_operation',
  {
    ...DEFAULT_COLUMNS,
    // reference to bill of materials
    sequence: integer().notNull().default(0),
    bill_of_materials_id: integer()
      .notNull()
      .references(() => billOfMaterialsTable.id, { onDelete: 'cascade' }),
    // reference to workcenter
    workcenter_id: integer()
      .notNull()
      .references(() => workcenterTable.id),
    name: text().notNull(),
    duration_in_minutes: integer().notNull(),
    active: boolean().notNull().default(true),
    // NOTE: html for rich text editor
    notes: text(),
    worksheet: text().notNull(),
  },
);

export { billOfMaterialsLineOperationTable };
