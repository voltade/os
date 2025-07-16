import { relations, sql } from 'drizzle-orm';
import { date, jsonb, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { hrSchema } from '../schema.ts';
import { reportCalculationTable } from './report_calculation.ts';

export const payrollReportTable = hrSchema.table('payroll_report', {
  ...DEFAULT_COLUMNS,
  report_period_start: date().notNull(),
  report_period_end: date().notNull(),
  status: text().default('pending'),
  error_message: text(),
  metadata: jsonb().default(sql`'{}'::jsonb`),
});

export const payrollReportRelations = relations(
  payrollReportTable,
  ({ many }) => ({
    calculations: many(reportCalculationTable),
  }),
);
