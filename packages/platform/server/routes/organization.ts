import { eq } from 'drizzle-orm';

import {
  member as memberTable,
  organization as organizationTable,
  user as userTable,
} from '#drizzle/auth.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory.createApp().get('/', async (c) => {
  const oauth2Data = c.get('oauth2');
  if (!oauth2Data) {
    return c.json({ error: 'No oauth2 data' }, 400);
  }

  const { email } = oauth2Data;
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (user.length === 0) {
    return c.json({ error: 'User not found' }, 400);
  }

  const { id: userId } = user[0];

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
