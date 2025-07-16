import { integer, jsonb, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { projectsTable } from './projects.ts';

const stagesTable = internalSchema.table('project_stages', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  project_id: integer().references(() => projectsTable.id),
  task_order: jsonb().$type<Record<string, number>>(),
});

export { stagesTable };
