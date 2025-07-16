import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productSchema } from '../schema.ts';

export const comboTable = productSchema.table('combo', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});
