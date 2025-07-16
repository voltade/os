import { integer, text, timestamp } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { taskStatusEnum } from '../enums.ts';
import { projectSchema } from '../schema.ts';
import { stageTable } from './stage.ts';

export const taskTable = projectSchema.table('task', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  // description of the task
  description: text(),
  status: taskStatusEnum().notNull().default('pending'),
  due_date: timestamp(),
  stage_id: integer().references(() => stageTable.id),
  priority: integer().notNull().default(0),
  note: text().notNull().default(''),
});
