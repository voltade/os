import { relations } from 'drizzle-orm';
import { integer, text, time } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationDayOfTheWeek } from '../enums.ts';
import { educationSchema } from '../schema.ts';
import { educationCourseTable } from './course.ts';
import { educationLessonTable } from './lesson.ts';
import { educationLevelGroupTable } from './level_group.ts';
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

  // E-Learning
  course_id: integer('course_id').references(() => educationCourseTable.id, {
    onDelete: 'restrict',
  }),
});

export const educationClassTableRelations = relations(
  educationClassTable,
  ({ many, one }) => ({
    lessons: many(educationLessonTable),
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
  }),
);
