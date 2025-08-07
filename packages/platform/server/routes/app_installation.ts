import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  appInstallationSchema,
  appInstallationTable,
} from '#drizzle/app_installation.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory
  .createApp()
  .post('/', zValidator('json', appInstallationSchema.create), async (c) => {
    const createObj = c.req.valid('json');

    const appInstallation = await db
      .insert(appInstallationTable)
      .values(createObj)
      .returning();

    return c.json(appInstallation);
  })
  .get(
    '/',
    zValidator('query', appInstallationSchema.select.partial()),
    async (c) => {
      const selectObj = c.req.valid('query');

      const appInstallation = await db
        .select()
        .from(appInstallationTable)
        .where(
          and(
            ...Object.entries(selectObj).map(([key, value]) =>
              eq(
                appInstallationTable[
                  key as keyof typeof appInstallationTable.$inferSelect
                ],
                value,
              ),
            ),
          ),
        );

      return c.json(appInstallation);
    },
  )
  .delete(
    '/',
    zValidator(
      'query',
      z.object({
        app_id: z.string(),
        environment_id: z.string(),
        org_id: z.string(),
      }),
    ),
    async (c) => {
      const { app_id, environment_id, org_id } = c.req.valid('query');

      const appInstallation = await db
        .delete(appInstallationTable)
        .where(
          and(
            eq(appInstallationTable.app_id, app_id),
            eq(appInstallationTable.environment_id, environment_id),
            eq(appInstallationTable.organization_id, org_id),
          ),
        )
        .returning();

      return c.json(appInstallation);
    },
  );
