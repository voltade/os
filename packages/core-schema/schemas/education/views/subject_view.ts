import { sql } from 'drizzle-orm';
import { pgView } from 'drizzle-orm/pg-core';

import { educationSubjectTable } from '../tables/subject.ts';

export const subjectView = pgView('subject_view')
  .with({
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationSubjectTable.id,
        name: educationSubjectTable.name,
      })
      .from(educationSubjectTable),
  );
