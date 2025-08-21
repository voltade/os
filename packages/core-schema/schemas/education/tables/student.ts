/**
 * This is a temporary table used to store students registered using the experimental student registration form.
 */

import { relations } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';
import { educationStudentJoinClassTable } from './student_join_class.ts';

export const educationStudentTable = educationSchema.table('student', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
});

export const educationStudentTableRelations = relations(
  educationStudentTable,
  ({ one, many }) => ({
    studentJoinClass: many(educationStudentJoinClassTable),
  }),
);
