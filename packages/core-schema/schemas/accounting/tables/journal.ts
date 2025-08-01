import { relations, type SQL, sql } from 'drizzle-orm';
import { foreignKey, integer, pgPolicy, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { journalTypeEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';
import { accountTable } from './account.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'invoice:' || cast(id as varchar))`;
}

export const journalTable = accountingSchema.table(
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

    /**
     * RLS policies for the journal table.
     * @see {@link openfga/invoice.fga}
     */
    pgPolicy('journal_select_policy', {
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_invoice'),
    }),
    pgPolicy('journal_insert_policy', {
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_invoice'),
    }),
    pgPolicy('journal_update_policy', {
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_invoice'),
    }),
    pgPolicy('journal_delete_policy', {
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_invoice'),
    }),
  ],
);

export const journalRelations = relations(journalTable, ({ one }) => ({
  defaultAccount: one(accountTable, {
    fields: [journalTable.default_account_id],
    references: [accountTable.id],
  }),
}));
