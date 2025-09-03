import { relations } from 'drizzle-orm';
import { integer, numeric, time } from 'drizzle-orm/pg-core';

import { productTemplateTable } from '../../product/tables/product_template.ts';
import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationDayOfTheWeek } from '../enums.ts';
import { educationSchema } from '../schema.ts';
import { educationClassroomTable } from './classroom.ts';
import { educationCourseTable } from './course.ts';
import { educationLessonTable } from './lesson.ts';
import { educationLevelGroupTable } from './level_group.ts';
import { educationStudentJoinClassTable } from './student_join_class.ts';
import { educationSubjectTable } from './subject.ts';

export const educationClassTable = educationSchema.table('class', {
  ...DEFAULT_COLUMNS,
  level_group_id: integer('level_group_id')
    // .notNull() TODO: Update the seed script and uncomment this.
    .references(() => educationLevelGroupTable.id, { onDelete: 'restrict' }),
  subject_id: integer('subject_id')
    // .notNull() TODO: Update the seed script and uncomment this.
    .references(() => educationSubjectTable.id, { onDelete: 'restrict' }),

  // Fields for regular lessons.
  usual_day_of_the_week: educationDayOfTheWeek('usual_day_of_the_week'),
  usual_start_time_utc: time({ withTimezone: false }),
  usual_end_time_utc: time({ withTimezone: false }),
  usual_classroom_id: integer('usual_classroom_id').references(
    () => educationClassroomTable.id,
    {
      onDelete: 'set null',
    },
  ),
  usual_lesson_price_sgd: numeric().notNull().default('0'),

  // E-Learning
  course_id: integer('course_id').references(() => educationCourseTable.id, {
    onDelete: 'set null',
  }),

  // Link to product schema.
  product_template_id: integer()
    // .notNull() TODO: Update the seed script and uncomment this.
    .references(() => productTemplateTable.id),
});

export const educationClassTableRelations = relations(
  educationClassTable,
  ({ many, one }) => ({
    lessons: many(educationLessonTable),
    studentJoinClass: many(educationStudentJoinClassTable),
    level_group: one(educationLevelGroupTable, {
      fields: [educationClassTable.level_group_id],
      references: [educationLevelGroupTable.id],
    }),
    subject: one(educationSubjectTable, {
      fields: [educationClassTable.subject_id],
      references: [educationSubjectTable.id],
    }),
    course: one(educationCourseTable, {
      fields: [educationClassTable.course_id],
      references: [educationCourseTable.id],
    }),
    product_template: one(productTemplateTable, {
      fields: [educationClassTable.product_template_id],
      references: [productTemplateTable.id],
    }),
    usual_classroom: one(educationClassroomTable, {
      fields: [educationClassTable.usual_classroom_id],
      references: [educationClassroomTable.id],
    }),
  }),
);
