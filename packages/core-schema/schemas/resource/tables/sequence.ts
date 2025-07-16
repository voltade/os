import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const sequenceTable = internalSchema
  .table('resource_sequence', {
    ...DEFAULT_COLUMNS,
    type: text().notNull().unique(),
    prefix: text().notNull().unique(),
    current_year: integer().notNull().default(sql`EXTRACT(YEAR FROM NOW())`),
    number_next: integer().notNull().default(1),
    number_increment: integer().notNull().default(1),
    padding: integer().notNull().default(5),
  })
  .enableRLS();
