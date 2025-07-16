import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { resourceSchema } from '../schema.ts';

export const countryTable = resourceSchema
  .table('country', {
    ...DEFAULT_COLUMNS,
    name: text().notNull().unique(),
    code: text().notNull().unique(),
  })
  .enableRLS();
