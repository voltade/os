import { relations, sql } from 'drizzle-orm';
import { date, integer, jsonb } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { hrSchema } from '../schema.ts';
import { employeeTable } from './employee.ts';
import { incentiveSchemeTable } from './incentive_scheme.ts';

export const employeeSchemeTable = hrSchema.table('payroll_employee_scheme', {
  ...DEFAULT_COLUMNS,
  employee_id: integer()
    .notNull()
    .references(() => employeeTable.id, { onDelete: 'cascade' }),
  scheme_id: integer().references(() => incentiveSchemeTable.id, {
    onDelete: 'cascade',
  }),
  start_date: date().notNull(),
  end_date: date(),
  metadata: jsonb().default(sql`'{}'::jsonb`),
});

export const employeeSchemeRelations = relations(
  employeeSchemeTable,
  ({ one }) => ({
    employee: one(employeeTable, {
      fields: [employeeSchemeTable.employee_id],
      references: [employeeTable.id],
    }),
    scheme: one(incentiveSchemeTable, {
      fields: [employeeSchemeTable.scheme_id],
      references: [incentiveSchemeTable.id],
    }),
  }),
);
