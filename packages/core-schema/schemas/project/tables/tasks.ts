import { integer, text, timestamp } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { taskStatusEnum } from '../enums.ts';
import { stagesTable } from './stages.ts';

const tasksTable = internalSchema.table('project_tasks', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  // description of the task
  description: text(),
  status: taskStatusEnum().notNull().default('pending'),
  due_date: timestamp(),
  stage_id: integer().references(() => stagesTable.id),
  priority: integer().notNull().default(0),
  note: text().notNull().default(''),
});

export { tasksTable };
