import { eq, sql } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';

import { educationStudentTable } from '../tables/student.ts';
import { educationStudentJoinClassTable } from '../tables/student_join_class.ts';

export const studentView = pgView('student_view')
  .with({
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationStudentTable.id,
        name: educationStudentTable.name,
        phone: educationStudentTable.phone,
        school: educationStudentTable.school,
        email: educationStudentTable.email,
        is_active: educationStudentTable.is_active,
        class_ids:
          sql`coalesce(array_agg(distinct ${educationStudentJoinClassTable.class_id}), '{}'::int[])`.as(
            'class_ids',
          ),
      })
      .from(educationStudentTable)
      .leftJoin(
        educationStudentJoinClassTable,
        eq(educationStudentJoinClassTable.student_id, educationStudentTable.id),
      )
      .groupBy(
        educationStudentTable.id,
        educationStudentTable.name,
        educationStudentTable.phone,
        educationStudentTable.school,
        educationStudentTable.email,
        educationStudentTable.is_active,
      ),
  );
