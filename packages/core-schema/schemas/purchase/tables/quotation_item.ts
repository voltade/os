import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { purchaseSchema } from '../schema.ts';
import { quotationTable } from './quotation.ts';

export const quotationItemTable = purchaseSchema.table(
  'quotation_item',
  {
    ...DEFAULT_COLUMNS,
    quotation_id: integer().notNull(),
    product_id: integer().notNull(),
    unit_price: priceCol('unit_price').notNull(),
    unit_price_with_tax: priceCol('unit_price_with_tax').notNull(),
    moq: integer().notNull(), // minimum order quantity
  },
  (table) => [
    foreignKey({
      columns: [table.quotation_id],
      foreignColumns: [quotationTable.id],
      name: 'fk_quotation_item_quotation',
    }),
    foreignKey({
      columns: [table.product_id],
      foreignColumns: [productTable.id],
      name: 'fk_quotation_item_item',
    }),
  ],
);
