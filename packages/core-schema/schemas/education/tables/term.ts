import { relations } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { daterange } from '../../customTypes.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationAcademicYearTable } from './academic_year.ts';
import { educationLessonTable } from './lesson.ts';

export const educationTermTable = educationSchema.table('term', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
  date_range: daterange('date_range').notNull(),
  academic_year_id: integer('academic_year_id')
    .notNull()
    .references(() => educationAcademicYearTable.id, { onDelete: 'restrict' }),
});

// Add relations: a term belongs to one academic year
export const educationTermTableRelations = relations(
  educationTermTable,
  ({ one, many }) => ({
    academicYear: one(educationAcademicYearTable, {
      fields: [educationTermTable.academic_year_id],
      references: [educationAcademicYearTable.id],
    }),
    lessons: many(educationLessonTable),
  }),
);
