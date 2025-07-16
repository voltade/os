import { foreignKey, integer, primaryKey } from 'drizzle-orm/pg-core';

import { created_at, updated_at } from '../../utils.ts';
import { serviceSchema } from '../schema.ts';
import { appointmentResourceTable } from './appointment_resource.ts';
import { calendarEventTable } from './calendar_event.ts';

export const calendarEventResourceRelTable = serviceSchema
  .table(
    'calendar_event_resource_rel',
    {
      created_at,
      updated_at,

      event_id: integer().notNull(),
      resource_id: integer().notNull(),
    },
    (table) => [
      primaryKey({
        name: 'pk_calendar_event_resource_rel',
        columns: [table.event_id, table.resource_id],
      }),
      foreignKey({
        columns: [table.event_id],
        foreignColumns: [calendarEventTable.id],
        name: 'fk_calendar_event_resource_rel_calendar_event',
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.resource_id],
        foreignColumns: [appointmentResourceTable.id],
        name: 'fk_calendar_event_resource_rel_appointment_resource',
      }).onDelete('cascade'),
    ],
  )
  .enableRLS();
