import { relations } from 'drizzle-orm';
import { date, integer, numeric, text } from 'drizzle-orm/pg-core';

import { partnerTable } from '../../resource/tables/partner.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';
import { accountingMoveLineTable } from './move_line.ts';

export const accountingMoveTable = accountingSchema.table('move', {
  ...DEFAULT_COLUMNS,
  total_price: numeric().notNull(),
  invoice_date: date(),
  invoice_due_date: date(),
  subtotal_amount: numeric().notNull(), // Excluding tax.
  total_amount: numeric().notNull(), // Including tax.
  tax_amount: numeric().notNull(),
  name: text(),
  partner_id: integer().references(() => partnerTable.id),
});

export const accountingMoveTableRelations = relations(
  accountingMoveTable,
  ({ many }) => ({
    moveLines: many(accountingMoveLineTable),
  }),
);
