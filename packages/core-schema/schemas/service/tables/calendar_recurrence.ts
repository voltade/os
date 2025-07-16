import {
  boolean,
  foreignKey,
  integer,
  numeric,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { serviceSchema } from '../schema.ts';
import { calendarEventTable } from './calendar_event.ts';

// odoo still creates calendar events individually for recurring
// but they track recurrence rules to group them all together
export const calendarRecurrenceTable = serviceSchema.table(
  'calendar_recurrence',
  {
    ...DEFAULT_COLUMNS,

    base_event_id: integer(),

    type: text(), // daily, weekly, monthly, yearly, custom

    end_type: text(),
    until: timestamp(), // if end_type = enddate
    count: numeric(), // if end_type = count

    // i love odoo
    // bit flags maybe lol
    mon: boolean(),
    tue: boolean(),
    wed: boolean(),
    thu: boolean(),
    fri: boolean(),
    sat: boolean(),
    sun: boolean(),
  },
  (table) => [
    foreignKey({
      columns: [table.base_event_id],
      foreignColumns: [calendarEventTable.id],
      name: 'fk_calendar_recurrence_calendar_event',
    }),
  ],
);
