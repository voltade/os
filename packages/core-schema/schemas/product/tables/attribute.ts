import { relations } from 'drizzle-orm';
import { text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productSchema } from '../schema.ts';
import { productAttributeValueTable } from './attribute_value.ts';

export const productAttributeTable = productSchema.table('attribute', {
  ...DEFAULT_COLUMNS,
  name: text().notNull(),
});

export const productAttributeRelations = relations(
  productAttributeTable,
  ({ many }) => ({
    productAttributeValues: many(productAttributeValueTable),
  }),
);
