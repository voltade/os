import { integer, primaryKey } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { tagsTable } from './tags.ts';
import { tasksTable } from './tasks.ts';

const projectsTaskTagsTable = internalSchema.table(
  'project_task_tags',
  {
    task_id: integer()
      .notNull()
      .references(() => tasksTable.id),
    tag_id: integer()
      .notNull()
      .references(() => tagsTable.id),
  },
  (table) => [primaryKey({ columns: [table.task_id, table.tag_id] })],
);

export { projectsTaskTagsTable };
