import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { partnerTable } from '../../resource/tables/partner.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { serviceSchema } from '../schema.ts';
import { calendarEventTable } from './calendar_event.ts';

export const calendarAttendeeTable = serviceSchema
  .table(
    'calendar_attendee',
    {
      ...DEFAULT_COLUMNS,

      event_id: integer().notNull(),
      partner_id: integer().notNull(),

      // TODO -- enums
      state: text(),
      availability: text(),
    },
    (table) => [
      foreignKey({
        columns: [table.event_id],
        foreignColumns: [calendarEventTable.id],
        name: 'fk_calendar_attendee_calendar_event',
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.partner_id],
        foreignColumns: [partnerTable.id],
        name: 'fk_calendar_attendee_partner',
      }).onDelete('cascade'),
    ],
  )
  .enableRLS();
