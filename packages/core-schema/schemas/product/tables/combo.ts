import { text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const comboTable = internalSchema.table('product_combo', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});
