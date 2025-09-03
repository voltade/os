import { relations } from 'drizzle-orm';
import { integer, numeric } from 'drizzle-orm/pg-core';

import { tstzrange } from '../../customTypes.ts';
import { productTable } from '../../product/tables/product.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationClassTable } from './class.ts';
import { educationClassroomTable } from './classroom.ts';
import { educationLevelGroupTable } from './level_group.ts';
import { educationSubjectTable } from './subject.ts';
import { educationTermTable } from './term.ts';

export const educationLessonTable = educationSchema.table('lesson', {
  ...DEFAULT_COLUMNS,
  time: tstzrange().notNull(),
  level_group_id: integer('level_group_id')
    .notNull()
    .references(() => educationLevelGroupTable.id, { onDelete: 'restrict' }),
  subject_id: integer('subject_id')
    .notNull()
    .references(() => educationSubjectTable.id, { onDelete: 'restrict' }),
  term_id: integer('term_id')
    .notNull()
    .references(() => educationTermTable.id, {
      onDelete: 'set null',
    }),
  class_id: integer('class_id').references(() => educationClassTable.id, {
    onDelete: 'set null',
  }),
  classroom_id: integer('classroom_id')
    .notNull()
    .references(() => educationClassroomTable.id, {
      onDelete: 'set null',
    }),
  price_sgd: numeric().notNull().default('0'),

  // Link to product schema.
  product_id: integer()
    // .notNull() TODO: Update the seed script and uncomment this.
    .references(() => productTable.id),
});

export const educationLessonTableRelations = relations(
  educationLessonTable,
  ({ one }) => ({
    class: one(educationClassTable, {
      fields: [educationLessonTable.class_id],
      references: [educationClassTable.id],
    }),
    level_group: one(educationLevelGroupTable, {
      fields: [educationLessonTable.level_group_id],
      references: [educationLevelGroupTable.id],
    }),
    subject: one(educationSubjectTable, {
      fields: [educationLessonTable.subject_id],
      references: [educationSubjectTable.id],
    }),
    term: one(educationTermTable, {
      fields: [educationLessonTable.term_id],
      references: [educationTermTable.id],
    }),
    product: one(productTable, {
      fields: [educationLessonTable.product_id],
      references: [productTable.id],
    }),
    classroom: one(educationClassroomTable, {
      fields: [educationLessonTable.classroom_id],
      references: [educationClassroomTable.id],
    }),
  }),
);
