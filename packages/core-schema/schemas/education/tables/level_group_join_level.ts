import { relations } from 'drizzle-orm';
import { integer } from 'drizzle-orm/pg-core';

import { educationSchema } from '../schema.ts';
import { educationLevelTable } from './level.ts';
import { educationLevelGroupTable } from './level_group.ts';

export const educationLevelGroupJoinLevelTable = educationSchema.table(
  'level_group_join_level',
  {
    level_group_id: integer('level_group_id')
      .notNull()
      .references(() => educationLevelGroupTable.id),
    level_id: integer('level_id')
      .notNull()
      .references(() => educationLevelTable.id),
  },
);

export const educationLevelGroupJoinLevelTableRelations = relations(
  educationLevelGroupJoinLevelTable,
  ({ one }) => ({
    levelGroup: one(educationLevelGroupTable, {
      fields: [educationLevelGroupJoinLevelTable.level_group_id],
      references: [educationLevelGroupTable.id],
    }),
    level: one(educationLevelTable, {
      fields: [educationLevelGroupJoinLevelTable.level_id],
      references: [educationLevelTable.id],
    }),
  }),
);
