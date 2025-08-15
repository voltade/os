import { eq, sql } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';

import { educationClassTable } from '../tables/class.ts';
import { educationLevelGroupTable } from '../tables/level_group.ts';
import { educationSubjectTable } from '../tables/subject.ts';

export const classView = pgView('class_view')
  .with({
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationClassTable.id,
        level_group_id: educationClassTable.level_group_id,
        level_group_name: sql`${educationLevelGroupTable.name}`.as(
          'level_group_name',
        ),
        subject_id: educationClassTable.subject_id,
        subject_name: sql`${educationSubjectTable.name}`.as('subject_name'),
        usual_day_of_the_week: educationClassTable.usual_day_of_the_week,
        usual_start_time_utc: educationClassTable.usual_start_time_utc,
        usual_end_time_utc: educationClassTable.usual_end_time_utc,
        course_id: educationClassTable.course_id,
      })
      .from(educationClassTable)
      .leftJoin(
        educationSubjectTable,
        eq(educationClassTable.subject_id, educationSubjectTable.id),
      )
      .leftJoin(
        educationLevelGroupTable,
        eq(educationClassTable.level_group_id, educationLevelGroupTable.id),
      ),
  );
