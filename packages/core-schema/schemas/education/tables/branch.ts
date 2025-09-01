import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassroomTable } from './classroom.ts';

export const educationBranchTable = educationSchema.table('branch', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
});

export const educationBranchTableRelations = relations(
  educationBranchTable,
  ({ many }) => ({
    classrooms: many(educationClassroomTable),
  }),
);
