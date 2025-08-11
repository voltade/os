import { eq } from 'drizzle-orm';

import {
  member as memberTable,
  organization as organizationTable,
} from '#drizzle/auth.ts';
import { factory } from '#server/factory.ts';
import { authMiddleware } from '#server/lib/auth/index.ts';
import { db } from '#server/lib/db.ts';

export const route = factory
  .createApp()
  .get('/', authMiddleware(true), async (c) => {
    // biome-ignore lint/style/noNonNullAssertion: this is guaranteed by the auth middleware
    const { id: userId } = c.get('user')!;

    const memberships = await db
      .select()
      .from(memberTable)
      .where(eq(memberTable.userId, userId))
      .leftJoin(
        organizationTable,
        eq(memberTable.organizationId, organizationTable.id),
      );

    return c.json(memberships.map((m) => m.organization));
  });
