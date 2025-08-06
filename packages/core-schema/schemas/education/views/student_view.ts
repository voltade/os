import { pgView } from 'drizzle-orm/pg-core';

import { educationStudentTable } from '../tables/student.ts';

export const studentView = pgView('student_view')
  .with({
    checkOption: 'cascaded',
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationStudentTable.id,
        name: educationStudentTable.name,
        selected_class: educationStudentTable.selected_class,
      })
      .from(educationStudentTable),
  );
