import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory.createApp().get(
  '/',
  zValidator(
    'query',
    z.object({
      org_id: z.string().optional(),
    }),
  ),
  async (c) => {
    console.log(c.req.raw.headers);
    const { org_id } = c.req.valid('query');

    const apps = await db.query.appTable.findMany({
      where: org_id ? eq(appTable.organization_id, org_id) : undefined,
    });

    return c.json(apps);
  },
);
