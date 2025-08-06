import { type SQL, sql } from 'drizzle-orm';
import {
  foreignKey,
  integer,
  pgPolicy,
  text,
  varchar,
} from 'drizzle-orm/pg-core';

import { partnerTable } from '../../resource/tables/partner.ts';
import { userTable } from '../../resource/tables/user.ts';
import { DEFAULT_COLUMNS, priceCol, timestampCol } from '../../utils.ts';
import { purchaseQuotationType } from '../enums.ts';
import { purchaseSchema } from '../schema.ts';

/**
 * Check expression for RLS policies.
 */
function checkExpression(relation: string): SQL<boolean> {
  return sql<boolean>`allow('${sql.raw(relation)}', 'quotation:' || reference_id)`;
}

export const quotationTable = purchaseSchema.table(
  'quotation',
  {
    ...DEFAULT_COLUMNS,
    reference_id: varchar().notNull().unique().default('PLACE_HOLDER'),

    supplier_id: integer().notNull(),
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

    /**
     * RLS policies for the purchase quotation table.
     * @see {@link openfga/quotation.fga}
     */
    pgPolicy('purchase_quotation_select_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'select',
      using: checkExpression('can_view_quotation'),
    }),
    pgPolicy('purchase_quotation_insert_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'insert',
      withCheck: checkExpression('can_create_quotation'),
    }),
    pgPolicy('purchase_quotation_update_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'update',
      using: checkExpression('can_edit_quotation'),
    }),
    pgPolicy('purchase_quotation_delete_policy', {
      to: 'authenticated',
      as: 'permissive',
      for: 'delete',
      using: checkExpression('can_delete_quotation'),
    }),
  ],
);
