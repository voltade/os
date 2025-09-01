import { relations } from 'drizzle-orm';
import { boolean, foreignKey, integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationAttendanceStatus } from '../enums.ts';
import { educationSchema } from '../schema.ts';
import { educationLessonTable } from './lesson.ts';
import { educationStudentTable } from './student.ts';

export const educationAttendanceTable = educationSchema.table(
  'attendance',
  {
    ...DEFAULT_COLUMNS,
    student_id: integer('student_id')
      .notNull()
      .references(() => educationStudentTable.id),
    lesson_id: integer('lesson_id')
      .notNull()
      .references(() => educationLessonTable.id),
    rescheduled_to: integer('rescheduled_to'),
    rescheduled_from: integer('rescheduled_from'),
    is_paid_for: boolean().notNull().default(false),
    is_trial: boolean().notNull(),
    status: educationAttendanceStatus(),
  },
  (table) => [
    foreignKey({
      columns: [table.rescheduled_to],
      foreignColumns: [table.id],
      name: 'attendance_rescheduled_to_fkey',
    }),
    foreignKey({
      columns: [table.rescheduled_from],
      foreignColumns: [table.id],
      name: 'attendance_rescheduled_from_fkey',
    }),
  ],
);

export const educationAttendanceTableRelations = relations(
  educationAttendanceTable,
  ({ one }) => ({
    student: one(educationStudentTable, {
      fields: [educationAttendanceTable.student_id],
      references: [educationStudentTable.id],
    }),
    lesson: one(educationLessonTable, {
      fields: [educationAttendanceTable.lesson_id],
      references: [educationLessonTable.id],
    }),
    rescheduled_to_relation: one(educationAttendanceTable, {
      fields: [educationAttendanceTable.rescheduled_to],
      references: [educationAttendanceTable.id],
      relationName: 'rescheduled_to',
    }),
    rescheduled_from_relation: one(educationAttendanceTable, {
      fields: [educationAttendanceTable.rescheduled_from],
      references: [educationAttendanceTable.id],
      relationName: 'rescheduled_from',
    }),
  }),
);
