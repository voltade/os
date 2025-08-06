import * as schema from '@voltade/platform/drizzle';
import type { Command } from 'commander';
import { eq } from 'drizzle-orm';

import { getDb } from '#src/utils/db.ts';
import { getFinalOptions } from '#src/utils/index.ts';
import type { AppOptions } from './index.ts';

export async function listApps(command: Command) {
  const db = await getDb();

  const options = getFinalOptions<AppOptions>(command);

  let orgId: string | undefined;

  if (options.org) {
    const org = await db.query.organization.findFirst({
      where: eq(schema.organization.slug, options.org),
    });

    if (!org) {
      throw new Error(`Organization ${options.org} not found`);
    }

    orgId = org.id;
  }

  const apps = await db.query.appTable.findMany({
    where: orgId ? eq(schema.appTable.organization_id, orgId) : undefined,
  });

  console.log(apps);
}
