import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
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

    const checkAppInstallation = await db.query.appInstallationTable.findFirst({
      where: and(
        eq(appInstallationTable.app_id, createObj.app_id),
        eq(appInstallationTable.environment_id, createObj.environment_id),
        eq(appInstallationTable.organization_id, createObj.organization_id),
      ),
    });

    if (checkAppInstallation) {
      return c.json({ error: 'App installation already exists' }, 400);
    }

    const appInstallation = await db
      .insert(appInstallationTable)
      .values(createObj)
      .returning();

    return c.json(appInstallation);
  })
  .put(
    '/',
    zValidator(
      'json',
      z.object({
        app_build_id: z.string(),
        environment_id: z.string(),
        organization_id: z.string(),
        app_id: z.string(),
      }),
    ),
    async (c) => {
      const updateObj = c.req.valid('json');

      const appInstallation = await db
        .update(appInstallationTable)
        .set(updateObj)
        .where(
          and(
            eq(appInstallationTable.app_id, updateObj.app_id),
            eq(appInstallationTable.environment_id, updateObj.environment_id),
            eq(appInstallationTable.organization_id, updateObj.organization_id),
          ),
        )
        .returning();

      return c.json(appInstallation);
    },
  )
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        environment_id: z.string(),
      }),
    ),
    async (c) => {
      const query = c.req.valid('query');
      // biome-ignore lint/style/noNonNullAssertion: this is guaranteed by the auth middleware
      const { activeOrganizationId } = c.get('session')!;

      if (!activeOrganizationId) {
        return c.json({ error: 'No active organization' }, 400);
      }

      const appInstallation = await db
        .select()
        .from(appInstallationTable)
        .where(
          and(
            eq(appInstallationTable.environment_id, query.environment_id),
            eq(appInstallationTable.organization_id, activeOrganizationId),
          ),
        )
        .innerJoin(appTable, eq(appInstallationTable.app_id, appTable.id));

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
