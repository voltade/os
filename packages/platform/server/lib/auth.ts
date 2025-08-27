import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  bearer,
  emailOTP,
  jwt,
  oidcProvider,
  openAPI,
  organization,
} from 'better-auth/plugins';
import { eq } from 'drizzle-orm';

import {
  member as memberTable,
  organization as organizationTable,
} from '#drizzle/auth.ts';
import { platformEnvVariables } from '#server/env.ts';
import { db } from '#server/lib/db.ts';
import { mailer } from '#server/lib/mailer.ts';
import { nanoid } from '#server/lib/nanoid.ts';

export const BASE_URL = `${platformEnvVariables.VITE_APP_URL}/api/auth`;

// https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
  appName: 'Voltade OS',
  baseURL: BASE_URL,
  trustedOrigins: [platformEnvVariables.VITE_APP_URL],
  secret: platformEnvVariables.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  user: {
    additionalFields: {
      phone: {
        type: 'string',
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin({
      adminRoles: ['system_admin'],
      adminUserIds: ['admin'],
    }),
    apiKey(),
    bearer(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log(
            `Sending verification email to ${email} with otp: ${otp}`,
          );
        }
        await mailer.sendMail({
          to: email,
          subject: 'Verify your email',
          text: `Your verification code is: ${otp}`,
        });
      },
    }),
    oidcProvider({
      loginPage: '/signin',
      consentPage: '/oauth/consent',
      accessTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days
      useJWTPlugin: true,
    }),
    openAPI({
      path: '/docs',
    }),
    jwt({
      jwt: {
        expirationTime: '1h',
        definePayload: async ({ user }) => {
          const memberships = await db
            .select({
              organization_slug: organizationTable.slug,
              member_role: memberTable.role,
            })
            .from(memberTable)
            .innerJoin(
              organizationTable,
              eq(organizationTable.id, memberTable.organizationId),
            )
            .where(eq(memberTable.userId, user.id));
          return {
            // array of organization slugs, for https://docs.postgrest.org/en/v13/references/auth.html#jwt-aud-claim-validation
            aud: memberships.map(({ organization_slug }) => organization_slug),
            // for postgrest user impersonation: https://docs.postgrest.org/en/v13/references/auth.html#jwt-based-user-impersonation
            role: 'authenticated',
            // pass platform's organization member roles, for runner to check permissions
            roles: Object.fromEntries(
              memberships.map(({ organization_slug, member_role }) => [
                organization_slug,
                member_role,
              ]),
            ),
          };
        },
      },
    }),
    organization({
      allowUserToCreateOrganization: (user) => user.role === 'system_admin',
      membershipLimit: 10000,
      requireEmailVerificationOnInvitation: true,
      async sendInvitationEmail(data) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log(
            `Sending invitation email to ${data.email} for organization ${data.organization.name}`,
          );
        }
        const inviteLink = `${platformEnvVariables.VITE_APP_URL}/accept-invitation/${data.id}`;
        console.log(`Invite link: ${inviteLink}`);
        await mailer.sendMail({
          to: data.email,
          subject: `Invitation to join ${data.organization.name}`,
          html: `
            <p>You've been invited to join ${data.organization.name}.</p>
            <p><a href="${inviteLink}">Accept Invitation</a></p>
          `,
        });
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  onAPIError: {
    throw: true,
    onError: (error) => {
      console.error('Auth error:', error);
    },
  },
  advanced: {
    database: {
      generateId: ({ model, size }) => {
        if (model === 'organization') {
          return nanoid(7);
        }
        return nanoid(size);
      },
    },
    cookiePrefix: 'platform',
    crossSubDomainCookies: {
      enabled: true,
      domain: new URL(platformEnvVariables.VITE_APP_URL).hostname,
    },
  },
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session'];
