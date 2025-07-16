import { integer, jsonb, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { projectSchema } from '../schema.ts';
import { projectTable } from './project.ts';

export const stageTable = projectSchema.table('stage', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  project_id: integer().references(() => projectTable.id),
  task_order: jsonb().$type<Record<string, number>>(),
});
