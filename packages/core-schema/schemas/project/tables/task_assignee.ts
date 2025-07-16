import { integer, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { projectSchema } from '../schema.ts';
import { taskTable } from './task.ts';

export const taskAssigneeTable = projectSchema.table(
  'task_assignee',
  {
    task_id: integer()
      .notNull()
      .references(() => taskTable.id),
    user_id: uuid().notNull(),

    assigned_at: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.task_id, table.user_id] })],
);
