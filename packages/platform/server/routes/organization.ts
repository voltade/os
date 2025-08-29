import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  invitation as invitationTable,
  member as memberTable,
  organization as organizationTable,
} from '#drizzle/auth.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { nanoid } from '#server/lib/nanoid.ts';
import { auth } from '#server/middlewares/auth.ts';
import { jwt } from '#server/middlewares/jwt.ts';

export const route = factory
  .createApp()
  .get(
    '/public',
    zValidator(
      'query',
      z.object({
        organizationSlug: z.string(),
      }),
    ),
    async (c) => {
      const organizations = await db
        .select({
          slug: organizationTable.slug,
          name: organizationTable.name,
          logo: organizationTable.logo,
        })
        .from(organizationTable)
        .where(
          eq(organizationTable.slug, c.req.valid('query').organizationSlug),
        )
        .limit(1);
      return c.json(organizations[0] || null);
    },
  )
  .get('/', auth(), async (c) => {
    const { id: userId } = c.get('user');

    const memberships = await db
      .select()
      .from(memberTable)
      .where(eq(memberTable.userId, userId))
      .leftJoin(
        organizationTable,
        eq(memberTable.organizationId, organizationTable.id),
      );

    return c.json(memberships.map((m) => m.organization));
  })
  .post(
    '/guest/invite',
    zValidator(
      'json',
      z.object({
        email: z.string(),
        organizationId: z.string(),
        redirectUrl: z.string().optional(),
      }),
    ),
    jwt(),
    async (c) => {
      const { organizationId, email, redirectUrl } = c.req.valid('json');

      const inviteId = nanoid(21);
      await db.insert(invitationTable).values({
        id: inviteId,
        organizationId,
        email,
        role: 'guest',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        inviterId: 'admin',
        data: redirectUrl ? JSON.stringify({ redirectUrl }) : null,
      });

      return c.json({ inviteId });
    },
  )
  .post(
    '/guest/add',
    zValidator(
      'json',
      z.object({
        organizationId: z.string(),
        userId: z.string(),
      }),
    ),
    jwt(),
    async (c) => {
      const { userId, organizationId } = c.req.valid('json');
      const jwtPayload = c.get('jwtPayload');
      if (jwtPayload.role !== 'runner' || jwtPayload.orgId !== organizationId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const membershipData = await db
        .select()
        .from(memberTable)
        .where(
          and(
            eq(memberTable.userId, userId),
            eq(memberTable.organizationId, organizationId),
          ),
        )
        .limit(1);
      const isMember = !!membershipData[0];

      if (!isMember) {
        await db.insert(memberTable).values({
          id: nanoid(21),
          userId,
          organizationId,
          role: 'guest',
          createdAt: new Date(),
        });
      }
      return c.json({ success: true });
    },
  )
  .put(
    '/',
    zValidator(
      'json',
      z.object({
        organizationId: z.string(),
        name: z.string().optional(),
        logo: z.string().optional(),
      }),
    ),
    auth(),
    async (c) => {
      const { id: userId } = c.get('user');
      const { organizationId, name, logo } = c.req.valid('json');

      // Check if the user is a member of the organization
      const membership = await db
        .select()
        .from(memberTable)
        .where(
          and(
            eq(memberTable.userId, userId),
            eq(memberTable.organizationId, organizationId),
          ),
        )
        .limit(1);

      if (membership.length === 0) {
        return c.json({ error: 'Not a member of this organization' }, 403);
      }

      // Build update object with only provided fields
      const updateData: { name?: string; logo?: string } = {};
      if (name !== undefined) updateData.name = name;
      if (logo !== undefined) updateData.logo = logo;

      if (Object.keys(updateData).length === 0) {
        return c.json({ error: 'No valid fields to update' }, 400);
      }

      // Update the organization
      await db
        .update(organizationTable)
        .set(updateData)
        .where(eq(organizationTable.id, organizationId));

      return c.json({ success: true });
    },
  );
