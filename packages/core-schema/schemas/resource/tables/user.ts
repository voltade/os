import { integer, varchar } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';

export const userTable = internalSchema
  .table('resource_user', {
    ...DEFAULT_COLUMNS,
    first_name: varchar({ length: 255 }).notNull(),
    last_name: varchar({ length: 255 }).notNull(),
    created_by: integer(),
    updated_by: integer(),
  })
  .enableRLS();
