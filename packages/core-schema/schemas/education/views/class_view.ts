import { pgView } from 'drizzle-orm/pg-core';

import { educationClassTable } from '../tables/class.ts';

export const classView = pgView('class_view')
  .with({
    checkOption: 'cascaded',
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationClassTable.id,
        temporary_name: educationClassTable.temporary_name,
      })
      .from(educationClassTable),
  );
