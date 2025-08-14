import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { createAppSchema, updateAppSchema } from '#shared/schemas/app.ts';

export const route = factory
  .createApp()
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        org_id: z.string().optional(),
      }),
    ),
    async (c) => {
      const { org_id } = c.req.valid('query');

      const apps = await db.query.appTable.findMany({
        where: org_id ? eq(appTable.organization_id, org_id) : undefined,
      });

      return c.json<(typeof appTable.$inferSelect)[]>(apps);
    },
  )
  .post('/', zValidator('json', createAppSchema), async (c) => {
    // biome-ignore lint/style/noNonNullAssertion: session is guaranteed by auth middleware
    const { activeOrganizationId } = c.get('session')!;
    if (!activeOrganizationId) {
      return c.json({ error: 'No active organization' }, 400);
    }

    const body = c.req.valid('json');

    const [created] = await db
      .insert(appTable)
      .values({
        organization_id: activeOrganizationId,
        ...body,
      })
      .returning();

    return c.json(created);
  })
  .put('/', zValidator('json', updateAppSchema), async (c) => {
    // biome-ignore lint/style/noNonNullAssertion: session is guaranteed by auth middleware
    const { activeOrganizationId } = c.get('session')!;
    if (!activeOrganizationId) {
      return c.json({ error: 'No active organization' }, 400);
    }

    const { id, ...rest } = c.req.valid('json');

    const existing = await db
      .select()
      .from(appTable)
      .where(
        and(
          eq(appTable.id, id),
          eq(appTable.organization_id, activeOrganizationId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      return c.json({ error: 'App not found' }, 404);
    }

    const updated = await db
      .update(appTable)
      .set({ ...rest })
      .where(
        and(
          eq(appTable.id, id),
          eq(appTable.organization_id, activeOrganizationId),
        ),
      )
      .returning();

    return c.json(updated[0]);
  });
