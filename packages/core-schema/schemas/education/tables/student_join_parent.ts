import { integer, text } from 'drizzle-orm/pg-core';

import { educationSchema } from '../schema.ts';
import { educationParentTable } from './parent.ts';
import { educationStudentTable } from './student.ts';

export const educationStudentJoinParentTable = educationSchema.table(
  'student_join_parent',
  {
    student_id: integer('student_id')
      .notNull()
      .references(() => educationStudentTable.id),
    parent_id: integer('parent_id')
      .notNull()
      .references(() => educationParentTable.id),
    relationship: text('relationship').notNull(),
  },
);
