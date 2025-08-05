import { relations } from 'drizzle-orm';
import { integer } from 'drizzle-orm/pg-core';

import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';
import { educationSubjectTable } from './subject.ts';

export const classJoinSubjectTable = educationSchema.table(
  'class_join_subject',
  {
    classId: integer('class_id')
      .notNull()
      .references(() => educationClassTable.id),
    subjectId: integer('subject_id')
      .notNull()
      .references(() => educationSubjectTable.id),
  },
);

export const classJoinSubjectTableRelations = relations(
  classJoinSubjectTable,
  ({ one }) => ({
    class: one(educationClassTable, {
      fields: [classJoinSubjectTable.classId],
      references: [educationClassTable.id],
    }),
    subject: one(educationSubjectTable, {
      fields: [classJoinSubjectTable.subjectId],
      references: [educationSubjectTable.id],
    }),
  }),
);
