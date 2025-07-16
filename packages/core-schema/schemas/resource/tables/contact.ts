import { foreignKey, integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { resourceSchema } from '../schema.ts';
import { partnerTable } from './partner.ts';

export const contactTable = resourceSchema
  .table(
    'contact',
    {
      ...DEFAULT_COLUMNS,
      name: text().notNull(),
      partner_id: integer(),
      email: text(),
      phone: text(),
    },
    (table) => [
      foreignKey({
        name: 'contact_partner_id_fk',
        columns: [table.partner_id],
        foreignColumns: [partnerTable.id],
      }),
    ],
  )
  .enableRLS();
