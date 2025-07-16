import { integer, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { tasksTable } from './tasks.ts';

const taskAssigneesTable = internalSchema.table(
  'project_task_assignees',
  {
    task_id: integer()
      .notNull()
      .references(() => tasksTable.id),
    user_id: uuid().notNull(),

    assigned_at: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.task_id, table.user_id] })],
);

export { taskAssigneesTable };
