import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationLessonTable } from './lesson.ts';
import { educationLevelTable } from './level.ts';
import { educationSubjectTable } from './subject.ts';

export const educationClassTable = educationSchema.table('class', {
  ...DEFAULT_COLUMNS,
  temporary_name: text('temporary_name'),
});

export const educationClassTableRelations = relations(
  educationClassTable,
  ({ many }) => ({
    lessons: many(educationLessonTable),
    // Reason for multiple levels: "Upper Sec classes" are for Sec 3, 4, and 5 students.
    levels: many(educationLevelTable),
    subjects: many(educationSubjectTable),
  }),
);
