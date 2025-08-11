import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';
import { educationLessonTable } from './lesson.ts';
import { educationLevelTable } from './level.ts';

export const educationLevelGroupTable = educationSchema.table('level_group', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});

export const educationLevelGroupTableRelations = relations(
  educationLevelGroupTable,
  ({ many }) => ({
    levels: many(educationLevelTable),
    classes: many(educationClassTable),
    lessons: many(educationLessonTable),
  }),
);
