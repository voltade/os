import { boolean, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { approvalCategoryType } from '../enums.ts';
import { approvalSchema } from '../schema.ts';

export const approvalCategoryTable = approvalSchema.table('category', {
  ...DEFAULT_COLUMNS,
  //TODO: enum this
  approval_type: approvalCategoryType().notNull(),
  name: text('name').notNull(),
  is_sequential: boolean().notNull().default(false),
});
