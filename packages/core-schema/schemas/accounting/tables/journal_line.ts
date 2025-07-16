import { date, foreignKey, integer } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';
import { accountTable } from './account.ts';
import { journalEntryTable } from './journal_entry.ts';

export const journalLineTable = accountingSchema
  .table(
    'journal_line',
    {
      ...DEFAULT_COLUMNS,
      journal_entry_id: integer().notNull(),
      account_id: integer().notNull(),
      own_entity_id: integer().notNull(),
      partner_id: integer(),
      contact_id: integer(),
      date: date().notNull(),
    },
    (table) => [
      foreignKey({
        name: 'journal_line_journal_entry_id_fk',
        columns: [table.journal_entry_id],
        foreignColumns: [journalEntryTable.id],
      }),
      foreignKey({
        name: 'journal_line_account_id_fk',
        columns: [table.account_id],
        foreignColumns: [accountTable.id],
      }),
    ],
  )
  .enableRLS();
