import { zValidator } from '@hono/zod-validator';
import { and, eq, gt } from 'drizzle-orm';
import { z } from 'zod';

import {
  invitation as invitationTable,
  member as memberTable,
  user as userTable,
} from '#drizzle/auth.ts';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { authMiddleware } from '#server/lib/auth.ts';
import { db } from '#server/lib/db.ts';
import { mailer } from '#server/lib/mailer.ts';
import { nanoid } from '#server/lib/nanoid.ts';

const inviteMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'owner']).default('member'),
});

const updateRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(['admin', 'member', 'owner']),
});

export const route = factory
  .createApp()
  .use(authMiddleware(true))
  .post('/invite', zValidator('json', inviteMemberSchema), async (c) => {
    const { email, role } = c.req.valid('json');
    const session = c.get('session');
    const user = c.get('user');
    const organizationId = session?.activeOrganizationId;

    if (!session || !user || !organizationId) {
      return c.json({ error: 'No active organization' }, 400);
    }

    // Check inviter's role and permissions
    const inviterMember = await db
      .select()
      .from(memberTable)
      .where(
        and(
          eq(memberTable.userId, user.id),
          eq(memberTable.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (inviterMember.length === 0) {
      return c.json(
        { error: 'You are not a member of this organization' },
        403,
      );
    }

    const inviterRole = inviterMember[0].role;

    // Only admins and owners can invite members
    if (inviterRole !== 'admin' && inviterRole !== 'owner') {
      return c.json(
        { error: 'Only admins and owners can invite members' },
        403,
      );
    }

    // Role hierarchy validation - prevent inviting higher roles
    if (inviterRole === 'admin' && (role === 'owner' || role === 'admin')) {
      return c.json({ error: 'Admins cannot invite admins or owners' }, 403);
    }

    try {
      // Check if a user with this email exists
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1);

      // If user exists and is already a member, block
      if (existingUser.length > 0) {
        const isAlreadyMember = await db
          .select()
          .from(memberTable)
          .where(
            and(
              eq(memberTable.organizationId, organizationId),
              eq(memberTable.userId, existingUser[0].id),
            ),
          )
          .limit(1);

        if (isAlreadyMember.length > 0) {
          return c.json(
            { error: 'User is already a member of this organization' },
            409,
          );
        }
      }

      // Check for existing pending (non-expired) invitation to avoid duplicates
      const now = new Date();
      const existingPendingInvitation = await db
        .select()
        .from(invitationTable)
        .where(
          and(
            eq(invitationTable.organizationId, organizationId),
            eq(invitationTable.email, email),
            eq(invitationTable.status, 'pending'),
            gt(invitationTable.expiresAt, now),
          ),
        )
        .limit(1);

      if (existingPendingInvitation.length > 0) {
        const invitationId = existingPendingInvitation[0].id;
        const inviteLink = `${appEnvVariables.VITE_APP_URL}/accept-invitation/${invitationId}`;

        if (import.meta.env.NODE_ENV === 'development') {
          console.log(`Invitation already pending for ${email}`);
          console.log(`Invite link: ${inviteLink}`);
        }

        // Optionally re-send the invitation email
        await mailer.sendMail({
          to: email,
          subject: 'Reminder: Invitation to join organization',
          html: `
              <p>You already have a pending invitation to join this organization.</p>
              <p><a href="${inviteLink}">Accept Invitation</a></p>
              <p>This link will expire on ${existingPendingInvitation[0].expiresAt.toUTCString()}.</p>
            `,
        });

        return c.json({
          success: true,
          message:
            'A pending invitation already exists. We have re-sent the email.',
          invitation: existingPendingInvitation[0],
        });
      }

      // Create a new invitation (regardless of user account existence)
      const invitationId = nanoid();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const [invitation] = await db
        .insert(invitationTable)
        .values({
          id: invitationId,
          organizationId,
          email,
          role,
          status: 'pending',
          expiresAt,
          inviterId: user.id,
        })
        .returning();

      // Send invitation email
      const inviteLink = `${appEnvVariables.VITE_APP_URL}/accept-invitation/${invitationId}`;

      if (import.meta.env.NODE_ENV === 'development') {
        console.log(`Sending invitation email to ${email}`);
        console.log(`Invite link: ${inviteLink}`);
      }

      await mailer.sendMail({
        to: email,
        subject: 'Invitation to join organization',
        html: `
            <p>You've been invited to join an organization${role ? ` as <strong>${role}</strong>` : ''}.</p>
            <p><a href="${inviteLink}">Accept Invitation</a></p>
            <p>This link will expire on ${expiresAt.toUTCString()}.</p>
          `,
      });

      return c.json({
        success: true,
        message: 'Invitation created and email sent',
        invitation,
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      return c.json(
        {
          error: 'Failed to invite member',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500,
      );
    }
  })
  .patch('/role', zValidator('json', updateRoleSchema), async (c) => {
    const { memberId, role } = c.req.valid('json');
    const session = c.get('session');
    const user = c.get('user');
    const organizationId = session?.activeOrganizationId;

    if (!session || !user || !organizationId) {
      return c.json({ error: 'No active organization' }, 400);
    }

    // Ensure the requester is a member and has permission
    const requester = await db
      .select()
      .from(memberTable)
      .where(
        and(
          eq(memberTable.organizationId, organizationId),
          eq(memberTable.userId, user.id),
        ),
      )
      .limit(1);

    if (requester.length === 0) {
      return c.json(
        { error: 'You are not a member of this organization' },
        403,
      );
    }

    if (requester[0].role !== 'owner') {
      return c.json({ error: 'Only owners can update member roles' }, 403);
    }

    // Ensure the target member exists in this organization
    const targetMembers = await db
      .select()
      .from(memberTable)
      .where(eq(memberTable.id, memberId))
      .limit(1);

    if (targetMembers.length === 0) {
      return c.json({ error: 'Member not found' }, 404);
    }

    const target = targetMembers[0];
    if (target.organizationId !== organizationId) {
      return c.json(
        { error: 'Member does not belong to this organization' },
        400,
      );
    }

    // Prevent demoting the last owner
    if (target.role === 'owner' && role !== 'owner') {
      const owners = await db
        .select()
        .from(memberTable)
        .where(
          and(
            eq(memberTable.organizationId, organizationId),
            eq(memberTable.role, 'owner'),
          ),
        );
      if (owners.length <= 1) {
        return c.json(
          { error: 'Cannot demote the last owner of the organization' },
          400,
        );
      }
    }

    const [updated] = await db
      .update(memberTable)
      .set({ role })
      .where(eq(memberTable.id, memberId))
      .returning();

    return c.json({ success: true, member: updated });
  });
