import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationLevelGroupJoinLevelTable } from './level_group_join_level.ts';

export const educationLevelTable = educationSchema.table('level', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});

export const educationLevelTableRelations = relations(
  educationLevelTable,
  ({ many }) => ({
    level_groups: many(educationLevelGroupJoinLevelTable),
  }),
);
