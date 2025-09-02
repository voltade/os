import { pgView } from 'drizzle-orm/pg-core';

import { educationTermTable } from '../tables/term.ts';

export const termView = pgView('term_view')
  .with({
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationTermTable.id,
        name: educationTermTable.name,
        date_range: educationTermTable.date_range,
        academic_year_id: educationTermTable.academic_year_id,
        is_active: educationTermTable.is_active,
      })
      .from(educationTermTable),
  );
