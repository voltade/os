import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationStudentJoinClassTable } from './student_join_class.ts';

export const educationStudentTable = educationSchema.table('student', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
  school: text('school').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
});

export const educationStudentTableRelations = relations(
  educationStudentTable,
  ({ many }) => ({
    studentJoinClass: many(educationStudentJoinClassTable),
  }),
);
