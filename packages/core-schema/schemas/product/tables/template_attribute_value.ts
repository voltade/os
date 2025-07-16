import { relations } from 'drizzle-orm';
import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS, priceCol } from '../../utils.ts';
import { productAttributeTable } from './attribute.ts';
import { productAttributeValueTable } from './attribute_value.ts';
import { productTemplateTable } from './product_template.ts';

export const productTemplateAttributeValueTable = internalSchema.table(
  'product_template_attribute_value',
  {
    ...DEFAULT_COLUMNS,
    product_template_id: integer().notNull(),
    attribute_id: integer().notNull(),
    attribute_value_id: integer().notNull(),
    extra_price: priceCol('extra_price').default('0').notNull(),
  },
  (table) => [
    foreignKey({
      name: 'product_template_attribute_value_product_template_id_fkey',
      columns: [table.product_template_id],
      foreignColumns: [productTemplateTable.id],
    }),
    foreignKey({
      name: 'product_template_attribute_value_attribute_id_fkey',
      columns: [table.attribute_id],
      foreignColumns: [productAttributeTable.id],
    }),
    foreignKey({
      name: 'product_template_attribute_value_attribute_value_id_fkey',
      columns: [table.attribute_value_id],
      foreignColumns: [productAttributeValueTable.id],
    }),
  ],
);

export const productTemplateAttributeValueRelations = relations(
  productTemplateAttributeValueTable,
  ({ one }) => ({
    productTemplate: one(productTemplateTable, {
      fields: [productTemplateAttributeValueTable.product_template_id],
      references: [productTemplateTable.id],
    }),
    attribute: one(productAttributeTable, {
      fields: [productTemplateAttributeValueTable.attribute_id],
      references: [productAttributeTable.id],
    }),
    attributeValue: one(productAttributeValueTable, {
      fields: [productTemplateAttributeValueTable.attribute_value_id],
      references: [productAttributeValueTable.id],
    }),
  }),
);
