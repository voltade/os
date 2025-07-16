import { integer, varchar } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { resourceSchema } from '../schema.ts';

export const userTable = resourceSchema
  .table('user', {
    ...DEFAULT_COLUMNS,
    first_name: varchar({ length: 255 }).notNull(),
    last_name: varchar({ length: 255 }).notNull(),
    created_by: integer(),
    updated_by: integer(),
  })
  .enableRLS();
