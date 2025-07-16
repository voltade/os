import { foreignKey, integer, primaryKey } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { userTable } from '../../resource/tables/user.ts';
import { appointmentTypeTable } from './appointment_type.ts';

export const appointmentTypeResUserRel = internalSchema
  .table(
    'service_appointment_type_res_user_rel',
    {
      type_id: integer().notNull(),
      user_id: integer().notNull(),
    },
    (table) => [
      primaryKey({
        name: 'pk_appointment_type_res_user_rel',
        columns: [table.type_id, table.user_id],
      }),
      foreignKey({
        columns: [table.type_id],
        foreignColumns: [appointmentTypeTable.id],
        name: 'fk_appointment_type_res_user_rel_appointment_type',
      }).onDelete('cascade'),
      foreignKey({
        columns: [table.user_id],
        foreignColumns: [userTable.id],
        name: 'fk_appointment_type_res_user_rel_user',
      }).onDelete('cascade'),
    ],
  )
  .enableRLS();
