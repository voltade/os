import { relations, type SQL, sql } from 'drizzle-orm';
import { date, foreignKey, integer, pgPolicy, text } from 'drizzle-orm/pg-core';

import { currencyTable } from '../../resource/tables/currency.ts';
import { partnerTable } from '../../resource/tables/partner.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { journalEntryStatusEnum, journalEntryTypeEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';
import { journalTable } from './journal.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'invoice:' || cast(journal_id as varchar))`;
}

export const journalEntryTable = accountingSchema.table(
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

    /**
     * RLS policies for the journal entry table.
     * @see {@link openfga/invoice.fga}
     */
    pgPolicy('journal_entry_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_invoice'),
    }),
    pgPolicy('journal_entry_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_invoice'),
    }),
    pgPolicy('journal_entry_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_invoice'),
    }),
    pgPolicy('journal_entry_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_invoice'),
    }),
  ],
);

export const journalEntryRelations = relations(
  journalEntryTable,
  ({ one }) => ({
    journal: one(journalTable, {
      fields: [journalEntryTable.journal_id],
      references: [journalTable.id],
    }),
    currency: one(currencyTable, {
      fields: [journalEntryTable.currency_id],
      references: [currencyTable.id],
    }),
    partner: one(partnerTable, {
      fields: [journalEntryTable.partner_id],
      references: [partnerTable.id],
    }),
  }),
);
