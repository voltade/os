import { boolean, decimal, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const appointmentTypeTable = internalSchema
  .table('service_appointment_type', {
    ...DEFAULT_COLUMNS,

    name: text().notNull(),

    appointment_duration: decimal().notNull(),
    appointment_manual_confirmation: boolean().default(false).notNull(),

    slot_creation_interval: decimal().notNull(),

    min_schedule_hours: decimal().notNull(),
    min_cancellation_hours: decimal().notNull(),

    schedule_based_on: text().notNull(),

    resource_manage_capacity: boolean().default(false).notNull(),
  })
  .enableRLS();
