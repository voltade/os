import { boolean, jsonb, text, timestamp } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { projectSchema } from '../schema.ts';

export const projectTable = projectSchema.table('project', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  start_date: timestamp(),
  end_date: timestamp(),
  starred: boolean().notNull().default(false),
  // stores the order of stages for this project
  stage_order: jsonb().$type<Record<string, number>>(),
});
