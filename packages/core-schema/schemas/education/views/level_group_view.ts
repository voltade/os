import { pgView } from 'drizzle-orm/pg-core';

import { educationLevelGroupTable } from '../tables/level_group.ts';

export const levelGroupView = pgView('level_group_view')
  .with({
    securityBarrier: true,
    securityInvoker: true,
  })
  .as((qb) =>
    qb
      .select({
        id: educationLevelGroupTable.id,
        name: educationLevelGroupTable.name,
      })
      .from(educationLevelGroupTable),
  );
