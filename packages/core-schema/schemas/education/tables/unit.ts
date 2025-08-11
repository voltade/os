import { relations } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationCourseTable } from './course.ts';
import { educationResourceTable } from './resource.ts';

export const educationUnitTable = educationSchema.table('unit', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
  course_id: integer('course_id')
    .notNull()
    .references(() => educationCourseTable.id, { onDelete: 'restrict' }),
});

export const educationUnitTableRelations = relations(
  educationUnitTable,
  ({ one, many }) => ({
    course: one(educationCourseTable, {
      fields: [educationUnitTable.course_id],
      references: [educationCourseTable.id],
    }),
    resources: many(educationResourceTable),
  }),
);
