import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { projectSchema } from '../schema.ts';

export const tagTable = projectSchema.table('tag', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  color: text().notNull(),
});
