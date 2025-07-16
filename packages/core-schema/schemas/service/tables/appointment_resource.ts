import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { serviceSchema } from '../schema.ts';

export const appointmentResourceTable = serviceSchema
  .table('appointment_resource', {
    ...DEFAULT_COLUMNS,

    name: text().notNull(),
    capacity: integer().default(1).notNull(),
  })
  .enableRLS();
