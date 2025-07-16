import { integer, numeric } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import {
  taxDistributionLineDocumentTypeEnum,
  taxDistributionLineTypeEnum,
} from '../enums.ts';
import { accountingSchema } from '../schema.ts';

export const taxDistributionLineTable = accountingSchema
  .table('tax_distribution_line', {
    ...DEFAULT_COLUMNS,

    document_type: taxDistributionLineDocumentTypeEnum().notNull(),
    type: taxDistributionLineTypeEnum().notNull(),
    factor_percentage: numeric(),

    tax_id: integer().notNull(),
    account_id: integer(),
  })
  .enableRLS();
