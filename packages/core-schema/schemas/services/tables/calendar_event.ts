import {
  boolean,
  foreignKey,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { userTable } from '../../resource/tables/user.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { appointmentTypeTable } from './appointment_type.ts';

export const calendarEventTable = internalSchema
  .table(
    'service_calendar_event',
    {
      ...DEFAULT_COLUMNS,

      user_id: integer(),
      appointment_id: integer(),

      recurrence_id: integer(),

      name: text().notNull(),
      location: text(),

      date_start: timestamp().notNull(),
      date_end: timestamp().notNull(),

      is_all_day: boolean().default(false).notNull(),

      assign_method: text().notNull(),
    },
    (table) => [
      foreignKey({
        columns: [table.user_id],
        foreignColumns: [userTable.id],
        name: 'fk_calendar_event_user',
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.appointment_id],
        foreignColumns: [appointmentTypeTable.id],
        name: 'fk_calendar_event_appointment_type',
      }).onDelete('cascade'),
    ],
  )
  .enableRLS();
