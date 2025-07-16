import { relations, sql } from 'drizzle-orm';
import { integer, jsonb, numeric, text, varchar } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { hrSchema } from '../schema.ts';
import { employeeTable } from './employee.ts';
import { incentiveSchemeTable } from './incentive_scheme.ts';
import { payrollReportTable } from './payroll_report.ts';

export const reportCalculationTable = hrSchema.table(
  'payroll_report_calculation',
  {
    ...DEFAULT_COLUMNS,
    report_id: integer('report_id').references(() => payrollReportTable.id, {
      onDelete: 'cascade',
    }),
    employee_id: integer('employee_id')
      .notNull()
      .references(() => employeeTable.id, { onDelete: 'cascade' }),
    scheme_id: integer('scheme_id').references(() => incentiveSchemeTable.id, {
      onDelete: 'cascade',
    }),
    name: text('name').notNull(),
    sql_results: jsonb().notNull(),
    calculation_trace: jsonb(),
    final_amount: numeric({ precision: 15, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).default(sql`'SGD'`),
    calculation_time_ms: integer(),
    config_version: varchar({ length: 64 }),
    description: text('description'),
  },
);

export const reportCalculationRelations = relations(
  reportCalculationTable,
  ({ one }) => ({
    employee: one(employeeTable, {
      fields: [reportCalculationTable.employee_id],
      references: [employeeTable.id],
    }),
    report: one(payrollReportTable, {
      fields: [reportCalculationTable.report_id],
      references: [payrollReportTable.id],
    }),
    scheme: one(incentiveSchemeTable, {
      fields: [reportCalculationTable.scheme_id],
      references: [incentiveSchemeTable.id],
    }),
  }),
);
