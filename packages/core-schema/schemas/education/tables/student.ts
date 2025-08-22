import { relations, sql } from 'drizzle-orm';
import { check, text } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from '../../utils.ts';
import { educationSchema } from '../schema.ts';
import { educationStudentJoinClassTable } from './student_join_class.ts';

export const educationStudentTable = educationSchema.table(
  'student',
  {
    ...DEFAULT_COLUMNS,
    platform_id: text('platform_id').unique(),
    name: text('name').notNull(),
    email: text('email'),
  },
  (table) => ({
    platformEmailCheck: check(
      'platform_email_check',
      sql`((${table.platform_id} IS NULL AND ${table.email} IS NULL) OR (${table.platform_id} IS NOT NULL AND ${table.email} IS NOT NULL))`,
    ),
  }),
);

export const educationStudentTableRelations = relations(
  educationStudentTable,
  ({ many }) => ({
    studentJoinClass: many(educationStudentJoinClassTable),
  }),
);
