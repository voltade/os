import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { approvalSchema } from '../schema.ts';
import { approvalCategoryTable } from './category.ts';

export const approvalRequestTable = approvalSchema.table(
  'request',
  {
    ...DEFAULT_COLUMNS,
    category_id: integer('category_id').notNull(),
    reference_id: integer('reference_id').notNull(),
  },
  (table) => [
    foreignKey({
      name: 'approval_request_category_id_fk',
      columns: [table.category_id],
      foreignColumns: [approvalCategoryTable.id],
    }),
  ],
);
