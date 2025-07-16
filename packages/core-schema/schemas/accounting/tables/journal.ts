import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { journalTypeEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';
import { accountTable } from './account.ts';

export const journalTable = accountingSchema
  .table(
    'journal',
    {
      ...DEFAULT_COLUMNS,
      name: text().notNull().unique(),
      type: journalTypeEnum().notNull(),
      sequence_prefix: text().notNull(),
      default_account_id: integer(),
    },
    (table) => [
      foreignKey({
        name: 'journal_default_account_id_fk',
        columns: [table.default_account_id],
        foreignColumns: [accountTable.id],
      }),
    ],
  )
  .enableRLS();
