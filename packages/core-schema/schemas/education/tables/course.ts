import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';

export const educationCourseTable = educationSchema.table('course', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
});

export const educationCourseTableRelations = relations(
  educationCourseTable,
  ({ many }) => ({
    classes: many(educationClassTable),
  }),
);
