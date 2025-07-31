import { sql } from 'drizzle-orm';

import { environmentTable } from '#drizzle/environment.ts';
import { orgTable } from '#drizzle/org.ts';
import { orgDomainTable } from '#drizzle/org_domain.ts';
import { db } from '#server/lib/db.ts';

await db.transaction(async (tx) => {
  await tx.execute(sql`truncate table org restart identity cascade`);
  await tx.execute(sql`truncate table org_domain restart identity cascade`);
  await tx.execute(sql`truncate table environment restart identity cascade`);

  await tx.insert(orgTable).values({ id: 'voltade', display_name: 'Voltade' });
  await tx
    .insert(orgDomainTable)
    .values({ org_id: 'voltade', domain: 'voltade.com' });
  await tx.insert(environmentTable).values({ id: 'abcd12', org_id: 'voltade' });
});
