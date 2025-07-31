import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory.createApp().post(
  '/build',
  zValidator(
    'json',
    z.object({
      appId: z.string(),
      orgId: z.string(),
    }),
  ),
  async (c) => {
    const { appId, orgId } = c.req.valid('json');

    const app = await db.query.appTable.findFirst({
      where: and(eq(appTable.id, appId), eq(appTable.org_id, orgId)),
    });

    if (!app) {
      return c.json({ error: 'App not found' }, 404);
    }
  },
);
