import { relations } from 'drizzle-orm';
import { text, varchar } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { hrSchema } from '../schema.ts';
import { employeeSchemeTable } from './employee_scheme.ts';
import { reportCalculationTable } from './report_calculation.ts';

export const incentiveSchemeTable = hrSchema.table('payroll_incentive_scheme', {
  ...DEFAULT_COLUMNS,
  name: varchar({ length: 255 }).notNull(),
  description: text(),
});

export const incentiveSchemeRelations = relations(
  incentiveSchemeTable,
  ({ many }) => ({
    employeeSchemes: many(employeeSchemeTable),
    calculations: many(reportCalculationTable),
  }),
);
