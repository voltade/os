import { integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const appointmentResourceTable = internalSchema
  .table('service_appointment_resource', {
    ...DEFAULT_COLUMNS,

    name: text().notNull(),
    capacity: integer().default(1).notNull(),
  })
  .enableRLS();
