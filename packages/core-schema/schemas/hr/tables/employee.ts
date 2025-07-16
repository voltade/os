import { relations } from 'drizzle-orm';
import { varchar } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { hrSchema } from '../schema.ts';
import { employeeSchemeTable } from './employee_scheme.ts';
import { reportCalculationTable } from './report_calculation.ts';

// Use entities table instead?

export const employeeTable = hrSchema.table('employee', {
  ...DEFAULT_COLUMNS,
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
});

export const employeeRelations = relations(employeeTable, ({ many }) => ({
  schemes: many(employeeSchemeTable),
  calculations: many(reportCalculationTable),
}));
