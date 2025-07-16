import { boolean, foreignKey, integer, time } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { appointmentTypeTable } from './appointment_type.ts';

export const appointmentTypeSchedule = internalSchema
  .table(
    'service_appointment_type_schedule',
    {
      ...DEFAULT_COLUMNS,

      type_id: integer().notNull(),

      from: time().notNull(),
      to: time().notNull(),

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
        columns: [table.type_id],
        foreignColumns: [appointmentTypeTable.id],
        name: 'fk_appointment_type_schedule_appointment_type',
      }).onDelete('cascade'),
    ],
  )
  .enableRLS();
