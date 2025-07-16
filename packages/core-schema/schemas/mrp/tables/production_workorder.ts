import { boolean, integer, text, timestamp } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { mrpSchema } from '../schema.ts';
import { productionTable } from './production.ts';
import { workcenterTable } from './workcenter.ts';

// copies over from the bill of materials line operation
export const productionWorkorderTable = mrpSchema.table(
  'production_workorder',
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
