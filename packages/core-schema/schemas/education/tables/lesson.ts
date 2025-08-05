import { relations } from 'drizzle-orm';
import { integer } from 'drizzle-orm/pg-core';

import { tstzrange } from '../../customTypes.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';

export const educationLessonTable = educationSchema.table('lesson', {
  ...DEFAULT_COLUMNS,
  time: tstzrange().notNull(),

  class_id: integer()
    .notNull()
    .references(() => educationClassTable.id, {
      onDelete: 'restrict',
    }),
});

export const educationLessonTableRelations = relations(
  educationLessonTable,
  ({ one }) => ({
    class: one(educationClassTable, {
      fields: [educationLessonTable.class_id],
      references: [educationClassTable.id],
    }),
  }),
);
