import { date, foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { currencyTable } from '../../resource/tables/currency.ts';
import { partnerTable } from '../../resource/tables/partner.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { journalEntryStatusEnum, journalEntryTypeEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';
import { journalTable } from './journal.ts';

export const journalEntryTable = accountingSchema
  .table(
    'journal_entry',
    {
      ...DEFAULT_COLUMNS,
      journal_id: integer().notNull(),
      currency_id: integer().notNull(),
      partner_id: integer(),
      contact_id: integer(),

      name: text().notNull().unique(),
      type: journalEntryTypeEnum().notNull(),
      date: date().notNull(),
      description: text().notNull(),
      status: journalEntryStatusEnum().notNull(),
      origin: text().notNull(),
    },
    (table) => [
      foreignKey({
        name: 'journal_entry_journal_id_fk',
        columns: [table.journal_id],
        foreignColumns: [journalTable.id],
      }),
      foreignKey({
        name: 'journal_entry_partner_id_fk',
        columns: [table.partner_id],
        foreignColumns: [partnerTable.id],
      }),
      foreignKey({
        name: 'journal_entry_currency_id_fk',
        columns: [table.currency_id],
        foreignColumns: [currencyTable.id],
      }),
    ],
  )
  .enableRLS();
