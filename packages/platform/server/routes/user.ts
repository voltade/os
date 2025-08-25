import { zValidator } from '@hono/zod-validator';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { member, user } from '#drizzle/auth.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { auth } from '#server/middlewares/auth.ts';

export const route = factory.createApp().get(
  '/user',
  auth(),
  zValidator(
    'query',
    z.object({
      organizationId: z.string(),
      userIds: z.array(z.string()).optional(),
    }),
  ),
  async (c) => {
    if (
      c.get('authType') !== 'static' ||
      c.req.header('Authorization') !== `Bearer ${c.env.RUNNER_SECRET_TOKEN}`
    ) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { organizationId, userIds } = c.req.valid('query');

    const memberships = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          userIds ? inArray(member.userId, userIds) : undefined,
        ),
      )
      .leftJoin(user, eq(member.userId, user.id));

    const users = memberships
      .map((membership) => {
        if (!membership.user) {
          return null;
        }

        return {
          ...membership.user,
          organizationId: membership.member.organizationId,
        };
      })
      .filter((user) => user !== null);

    return c.json(users);
  },
);
