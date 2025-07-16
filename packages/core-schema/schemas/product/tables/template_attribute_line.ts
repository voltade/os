import { relations } from 'drizzle-orm';
import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { productAttributeTable } from './attribute.ts';
import { productTemplateTable } from './product_template.ts';

export const productTemplateAttributeLineTable = internalSchema.table(
  'product_template_attribute_line',
  {
    ...DEFAULT_COLUMNS,
    product_template_id: integer().notNull(),
    attribute_id: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'product_template_attribute_line_product_template_id_fkey',
      columns: [table.product_template_id],
      foreignColumns: [productTemplateTable.id],
    }),
    foreignKey({
      name: 'product_template_attribute_line_attribute_id_fkey',
      columns: [table.attribute_id],
      foreignColumns: [productAttributeTable.id],
    }),
  ],
);

export const productTemplateAttributeLineRelations = relations(
  productTemplateAttributeLineTable,
  ({ one }) => ({
    productTemplate: one(productTemplateTable, {
      fields: [productTemplateAttributeLineTable.product_template_id],
      references: [productTemplateTable.id],
    }),
    attribute: one(productAttributeTable, {
      fields: [productTemplateAttributeLineTable.attribute_id],
      references: [productAttributeTable.id],
    }),
  }),
);
