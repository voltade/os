import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { daterange } from '../../customTypes.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationTermTable } from './term.ts';

export const educationAcademicYearTable = educationSchema.table(
  'academic_year',
  {
    ...DEFAULT_COLUMNS,
    name: text('name').notNull(),
    date_range: daterange('date_range').notNull(),
  },
);

export const educationAcademicYearTableRelations = relations(
  educationAcademicYearTable,
  ({ many }) => ({
    terms: many(educationTermTable),
  }),
);
