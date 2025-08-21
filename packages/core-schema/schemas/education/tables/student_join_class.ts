import { relations } from 'drizzle-orm';
import { integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';
import { educationStudentTable } from './student.ts';

export const educationStudentJoinClassTable = educationSchema.table(
  'student_join_class',
  {
    ...DEFAULT_COLUMNS,
    student_id: integer('student_id')
      .notNull()
      .references(() => educationStudentTable.id),
    class_id: integer('class_id')
      .notNull()
      .references(() => educationClassTable.id),
  },
);

export const educationStudentJoinClassTableRelations = relations(
  educationStudentJoinClassTable,
  ({ one }) => ({
    student: one(educationStudentTable, {
      fields: [educationStudentJoinClassTable.student_id],
      references: [educationStudentTable.id],
    }),
    class: one(educationClassTable, {
      fields: [educationStudentJoinClassTable.class_id],
      references: [educationClassTable.id],
    }),
  }),
);
