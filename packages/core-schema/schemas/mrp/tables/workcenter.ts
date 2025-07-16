import { boolean, integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

const workcenterTable = internalSchema.table('mrp_workcenter', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  location: text(),
  capacity: integer().notNull().default(0),
  type: text().notNull(),
  active: boolean().notNull().default(true),
});

export { workcenterTable };
