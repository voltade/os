import { text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

const tagsTable = internalSchema.table('project_tags', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  color: text().notNull(),
});

export { tagsTable };
