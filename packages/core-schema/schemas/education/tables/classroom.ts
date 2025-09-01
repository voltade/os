import { relations } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationBranchTable } from './branch.ts';
import { educationClassTable } from './class.ts';
import { educationLessonTable } from './lesson.ts';

export const educationClassroomTable = educationSchema.table('classroom', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  branch_id: integer('branch_id')
    .notNull()
    .references(() => educationBranchTable.id, { onDelete: 'restrict' }),
});

export const educationClassroomTableRelations = relations(
  educationClassroomTable,
  ({ one, many }) => ({
    branch: one(educationBranchTable, {
      fields: [educationClassroomTable.branch_id],
      references: [educationBranchTable.id],
    }),
    lessons: many(educationLessonTable),
    classes: many(educationClassTable),
  }),
);
