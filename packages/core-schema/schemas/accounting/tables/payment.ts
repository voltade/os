import { integer } from 'drizzle-orm/pg-core';

import { id } from '../../utils.ts';
import { paymentPartnerType, paymentTypeEnum } from '../enums.ts';
import { accountingSchema } from '../schema.ts';

export const paymentTable = accountingSchema
  .table('payment', {
    id,
    type: paymentTypeEnum().notNull(),
    partner_type: paymentPartnerType().notNull(),
    partner_id: integer().notNull(),
  })
  .enableRLS();
