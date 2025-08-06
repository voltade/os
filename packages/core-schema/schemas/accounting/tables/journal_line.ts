import { relations, type SQL, sql } from 'drizzle-orm';
import { date, foreignKey, integer, pgPolicy } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';
import { accountTable } from './account.ts';
import { journalEntryTable } from './journal_entry.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`exists(select 1 from ${journalEntryTable} je where journal_entry_id = je.id and allow('${sql.raw(relation)}', 'invoice:' || cast(je.id as varchar)))`;
}

export const journalLineTable = accountingSchema.table(
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

    /**
     * RLS policies for the journal line table.
     * @see {@link openfga/invoice.fga}
     */
    pgPolicy('journal_line_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_invoice'),
    }),
    pgPolicy('journal_line_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_invoice'),
    }),
    pgPolicy('journal_line_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_invoice'),
    }),
    pgPolicy('journal_line_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_invoice'),
    }),
  ],
);

export const journalLineRelations = relations(journalLineTable, ({ one }) => ({
  journalEntry: one(journalEntryTable, {
    fields: [journalLineTable.journal_entry_id],
    references: [journalEntryTable.id],
  }),
  account: one(accountTable, {
    fields: [journalLineTable.account_id],
    references: [accountTable.id],
  }),
}));
