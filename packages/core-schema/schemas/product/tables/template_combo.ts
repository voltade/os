import { relations } from 'drizzle-orm';
import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { comboTable } from './combo.ts';
import { productTemplateTable } from './product_template.ts';

export const templateComboTable = internalSchema.table(
  'template_combo',
  {
    ...DEFAULT_COLUMNS,
    combo_id: integer().notNull(),
    template_id: integer().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'template_combo_combo_id_fkey',
      columns: [table.combo_id],
      foreignColumns: [comboTable.id],
    }),
    foreignKey({
      name: 'template_combo_template_id_fkey',
      columns: [table.template_id],
      foreignColumns: [productTemplateTable.id],
    }),
  ],
);

export const templateComboRelations = relations(
  templateComboTable,
  ({ one }) => ({
    combo: one(comboTable, {
      fields: [templateComboTable.combo_id],
      references: [comboTable.id],
    }),
    template: one(productTemplateTable, {
      fields: [templateComboTable.template_id],
      references: [productTemplateTable.id],
    }),
  }),
);
