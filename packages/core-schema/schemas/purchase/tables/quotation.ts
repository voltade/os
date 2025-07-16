import { foreignKey, integer, text, varchar } from 'drizzle-orm/pg-core';

// import { purchaseQuotationSequence } from '../sequences.ts';

import { partnerTable } from '../../resource/tables/partner.ts';
import { userTable } from '../../resource/tables/user.ts';
import {
  DEFAULT_COLUMNS,
  // defaultPaddedSequence,
  priceCol,
  timestampCol,
} from '../../utils.ts';
import { purchaseQuotationType } from '../enums.ts';
import { purchaseSchema } from '../schema.ts';

export const quotationTable = purchaseSchema.table(
  'quotation',
  {
    ...DEFAULT_COLUMNS,
    reference_id: varchar().notNull().unique().default('PLACE_HOLDER'),
    // .default(defaultPaddedSequence('QO-', purchaseQuotationSequence, 5)),
    supplier_id: integer('supplier_id').notNull(),
    quotation_type: purchaseQuotationType().notNull(),
    total_value: priceCol('total_value').notNull(),
    notes: text(),
    valid_until: timestampCol('valid_until'),
    created_by: integer().notNull(),
    updated_by: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.supplier_id],
      foreignColumns: [partnerTable.id],
      name: 'fk_quotation_supplier',
    }),
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [userTable.id],
      name: 'fk_quotation_created_by',
    }),
    foreignKey({
      columns: [table.updated_by],
      foreignColumns: [userTable.id],
      name: 'fk_quotation_updated_by',
    }),
  ],
);
