import { foreignKey, integer } from 'drizzle-orm/pg-core';

import { id } from '../../utils.ts';
import { accountingSchema } from '../schema.ts';
import { taxDistributionLineTable } from './tax_distribution_line.ts';
import { taxTagTable } from './tax_tag.ts';

export const taxDistributionLineTaxTagRelTable = accountingSchema
  .table(
    'tax_distribution_line_tax_tag_rel',
    {
      id,
      tax_distribution_line_id: integer().notNull(),
      tax_tag_id: integer().notNull(),
    },
    (table) => [
      foreignKey({
        name: 'tax_distribution_line_tax_tag_rel_tax_distribution_line_id_fk',
        columns: [table.tax_distribution_line_id],
        foreignColumns: [taxDistributionLineTable.id],
      }),
      foreignKey({
        name: 'tax_distribution_line_tax_tag_rel_tax_tag_id_fk',
        columns: [table.tax_tag_id],
        foreignColumns: [taxTagTable.id],
      }),
    ],
  )
  .enableRLS();
