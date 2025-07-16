import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productAttributeValueTable } from './attribute_value.ts';

export const productAttributeTable = internalSchema.table('product_attribute', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});

export const productAttributeRelations = relations(
  productAttributeTable,
  ({ many }) => ({
    productAttributeValues: many(productAttributeValueTable),
  }),
);
