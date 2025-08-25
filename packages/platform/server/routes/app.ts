import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { factory } from '#server/factory.ts';
import { auth } from '#server/middlewares/auth.ts';
import { drizzle } from '#server/middlewares/drizzle.ts';
import { createAppSchema, updateAppSchema } from '#shared/schemas/app.ts';

export const route = factory
  .createApp()
  .use(auth({ requireActiveOrganization: true }))
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        org_id: z.string().optional(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { org_id } = c.req.valid('query');
      const { tx } = c.var;

      const apps = await tx.query.appTable.findMany({
        where: org_id ? eq(appTable.organization_id, org_id) : undefined,
      });

      return c.json<(typeof appTable.$inferSelect)[]>(apps);
    },
  )
  .post('/', zValidator('json', createAppSchema), drizzle(), async (c) => {
    const { activeOrganizationId } = c.get('session');
    const body = c.req.valid('json');
    const { tx } = c.var;

    const [created] = await tx
      .insert(appTable)
      .values({
        organization_id: activeOrganizationId,
        ...body,
      })
      .returning();

    return c.json(created);
  })
  .put('/', zValidator('json', updateAppSchema), drizzle(), async (c) => {
    const { activeOrganizationId } = c.get('session');
    const { tx } = c.var;
    const { id, ...rest } = c.req.valid('json');

    const existing = await tx
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

    const updated = await tx
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
