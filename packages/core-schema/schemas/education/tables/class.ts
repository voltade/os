import { relations } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationLessonTable } from './lesson.ts';
import { educationLevelGroupTable } from './level_group.ts';
import { educationSubjectTable } from './subject.ts';

export const educationClassTable = educationSchema.table('class', {
  ...DEFAULT_COLUMNS,
  temporary_name: text('temporary_name'),
  level_group_id: integer('level_group_id')
    // .notNull() TODO: Update the seed script and uncomment this.
    .references(() => educationLevelGroupTable.id, { onDelete: 'restrict' }),
  subject_id: integer('subject_id')
    // .notNull() TODO: Update the seed script and uncomment this.
    .references(() => educationSubjectTable.id, { onDelete: 'restrict' }),
});

export const educationClassTableRelations = relations(
  educationClassTable,
  ({ many, one }) => ({
    lessons: many(educationLessonTable),
    level_group: one(educationLevelGroupTable, {
      fields: [educationClassTable.level_group_id],
      references: [educationLevelGroupTable.id],
    }),
    subject: one(educationSubjectTable, {
      fields: [educationClassTable.subject_id],
      references: [educationSubjectTable.id],
    }),
  }),
);
