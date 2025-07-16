import { text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const countryTable = internalSchema
  .table('resource_country', {
    ...DEFAULT_COLUMNS,
    name: text().notNull().unique(),
    code: text().notNull().unique(),
  })
  .enableRLS();
