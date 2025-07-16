import { integer, primaryKey } from 'drizzle-orm/pg-core';

import { projectSchema } from '../schema.ts';
import { tagTable } from './tag.ts';
import { taskTable } from './task.ts';

export const projectTaskTagTable = projectSchema.table(
  'task_tag',
  {
    task_id: integer()
      .notNull()
      .references(() => taskTable.id),
    tag_id: integer()
      .notNull()
      .references(() => tagTable.id),
  },
  (table) => [primaryKey({ columns: [table.task_id, table.tag_id] })],
);
