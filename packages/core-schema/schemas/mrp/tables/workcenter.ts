import { boolean, integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { mrpSchema } from '../schema.ts';

const workcenterTable = mrpSchema.table('workcenter', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
  description: text(),
  location: text(),
  capacity: integer().notNull().default(0),
  type: text().notNull(),
  active: boolean().notNull().default(true),
});

export { workcenterTable };
