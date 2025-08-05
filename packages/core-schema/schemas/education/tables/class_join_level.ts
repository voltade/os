import { relations } from 'drizzle-orm';
import { integer } from 'drizzle-orm/pg-core';

import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';
import { educationLevelTable } from './level.ts';

export const classJoinLevelTable = educationSchema.table('class_join_level', {
  classId: integer('class_id')
    .notNull()
    .references(() => educationClassTable.id),
  levelId: integer('level_id')
    .notNull()
    .references(() => educationLevelTable.id),
});

export const classJoinLevelTableRelations = relations(
  classJoinLevelTable,
  ({ one }) => ({
    class: one(educationClassTable, {
      fields: [classJoinLevelTable.classId],
      references: [educationClassTable.id],
    }),
    level: one(educationLevelTable, {
      fields: [classJoinLevelTable.levelId],
      references: [educationLevelTable.id],
    }),
  }),
);
