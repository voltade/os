import { boolean, integer, numeric, text } from 'drizzle-orm/pg-core';

import { id } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';

export const paymentTermTable = accountingSchema
  .table('payment_term', {
    id,
    entity_id: integer().notNull(),
    name: text().notNull(),
    note: text().notNull(),
    active: boolean().notNull().default(true),
    display_on_invoice: boolean().notNull().default(false),
    early_discount: boolean().notNull().default(false),
    discount_days: integer().notNull(),
    discount_percentage: numeric(),
  })
  .enableRLS();
