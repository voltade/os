import { integer, numeric } from 'drizzle-orm/pg-core';

import { id } from '../../utils.ts';
import {
  paymentTermLineDelayTypeEnum,
  paymentTermLineValueTypeEnum,
} from '../enums.ts';
import { accountingSchema } from '../schema.ts';

export const paymentTermLineTable = accountingSchema
  .table('payment_term_line', {
    id,
    payment_term_id: integer().notNull(),
    value_amount: numeric(),
    value_type: paymentTermLineValueTypeEnum().notNull(),
    delay_days: integer().notNull(),
    delay_type: paymentTermLineDelayTypeEnum().notNull(),
    on_the_day: integer(),
  })
  .enableRLS();
