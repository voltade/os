import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';

export const educationSubjectTable = educationSchema.table('subject', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});

export const educationSubjectTableRelations = relations(
  educationSubjectTable,
  ({ many }) => ({
    classes: many(educationClassTable),
  }),
);
