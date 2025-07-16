import { boolean, foreignKey, integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { approvalRequestStatusType } from '../enums.ts';
import { approvalSchema } from '../schema.ts';
import { approvalRequestTable } from './request.ts';

export const approvalRequestApproverTable = approvalSchema.table(
  'request_approver',
  {
    ...DEFAULT_COLUMNS,
    approval_request_id: integer().notNull(),
    sequence: integer('sequence').notNull(),
    is_required: boolean('is_required').notNull().default(false),
    status: approvalRequestStatusType('status').notNull().default('pending'),
  },
  (table) => [
    foreignKey({
      name: 'approval_request_approver_approval_request_id_fk',
      columns: [table.approval_request_id],
      foreignColumns: [approvalRequestTable.id],
    }),
  ],
);
