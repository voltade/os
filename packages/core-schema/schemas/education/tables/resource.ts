import { relations } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationUnitTable } from './unit.ts';

export const educationResourceTable = educationSchema.table('resource', {
  ...DEFAULT_COLUMNS,
  name: text('name').notNull(),
  resource_type: text('resource_type').notNull(),
  unit_id: integer('unit_id')
    .notNull()
    .references(() => educationUnitTable.id, { onDelete: 'restrict' }),
  link: text('link'),
  // TODO: Link this to Supabase Storage once the storage schema has been introspected.
  storage_id: text('storage_id'),
});

export const educationResourceTableRelations = relations(
  educationResourceTable,
  ({ one }) => ({
    unit: one(educationUnitTable, {
      fields: [educationResourceTable.unit_id],
      references: [educationUnitTable.id],
    }),
  }),
);
