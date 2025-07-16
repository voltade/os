import { foreignKey, integer, primaryKey } from 'drizzle-orm/pg-core';

import { created_at, updated_at } from '../../utils.ts';
import { serviceSchema } from '../schema.ts';
import { appointmentResourceTable } from './appointment_resource.ts';
import { appointmentTypeTable } from './appointment_type.ts';

export const appointmentTypeAppointmentResourceRel = serviceSchema
  .table(
    'appointment_type_appointment_resource_rel',
    {
      created_at,
      updated_at,

      type_id: integer().notNull(),
      resource_id: integer().notNull(),
    },
    (table) => [
      primaryKey({
        name: 'pk_appointment_type_appointment_resource_rel',
        columns: [table.type_id, table.resource_id],
      }),
      foreignKey({
        columns: [table.type_id],
        foreignColumns: [appointmentTypeTable.id],
        name: 'fk_appointment_type_appointment_resource_rel_appointment_type',
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.resource_id],
        foreignColumns: [appointmentResourceTable.id],
        name: 'fk_appointment_type_appointment_resource_rel_appointment_resource',
      }).onDelete('cascade'),
    ],
  )
  .enableRLS();
