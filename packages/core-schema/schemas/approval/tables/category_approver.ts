import { boolean, foreignKey, integer } from 'drizzle-orm/pg-core';

import { entityTable } from '../../resource/tables/entity.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { approvalSchema } from '../schema.ts';
import { approvalCategoryTable } from './category.ts';

export const approvalCategoryApproverTable = approvalSchema.table(
  'category_approver',
  {
    ...DEFAULT_COLUMNS,
    sequence: integer('sequence').notNull(),
    category_id: integer().notNull(),
    user_id: integer().notNull(),
    is_required: boolean().notNull().default(true),
  },
  (table) => [
    foreignKey({
      name: 'approval_category_approver_category_id_fk',
      columns: [table.category_id],
      foreignColumns: [approvalCategoryTable.id],
    }),
    foreignKey({
      name: 'approval_category_approver_user_id_fk',
      columns: [table.user_id],
      foreignColumns: [entityTable.id],
    }),
  ],
);
