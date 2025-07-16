import { boolean, integer, pgEnum, text, timestamp } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productionTable } from './production.ts';
import { workcenterTable } from './workcenter.ts';

const productionWorkorderStateEnum = internalSchema.enum(
  'production_workorder_state',
  ['pending', 'in_progress', 'completed', 'cancelled'],
);

// copies over from the bill of materials line operation
const productionWorkorderTable = internalSchema.table(
  'mrp_production_workorder',
  {
    ...DEFAULT_COLUMNS,
    sequence: integer().notNull().default(0),
    name: text().notNull(),
    duration_in_minutes: integer().notNull(),
    start_datetime: timestamp(),
    end_datetime: timestamp(),
    // reference to workcenter
    workcenter_id: integer()
      .notNull()
      .references(() => workcenterTable.id),
    production_id: integer()
      .notNull()
      .references(() => productionTable.id, { onDelete: 'cascade' }),
    active: boolean().notNull().default(true),
    // NOTE: html for rich text editor
    notes: text(),
    worksheet: text().notNull(),
  },
);

export { productionWorkorderTable, productionWorkorderStateEnum };
