import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';

export const educationParentTable = educationSchema.table('parent', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  email: text().notNull(),
  phone: text(),
});
