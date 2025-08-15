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
import { appEnvVariables } from '#server/env.ts';
import { db } from '#server/lib/db.ts';
import { mailer } from '#server/lib/mailer.ts';
import { nanoid } from '#server/lib/nanoid.ts';
import { ac, roles } from './permissions.ts';

export const BASE_URL = `${appEnvVariables.VITE_APP_URL}/api/auth`;

// https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
  appName: 'Voltade OS',
  baseURL: BASE_URL,
  trustedOrigins: [appEnvVariables.VITE_APP_URL],
  secret: appEnvVariables.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin(),
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
        audience: async ({ user }) => {
          const organizations = await db
            .select({
              slug: organizationTable.slug,
            })
            .from(memberTable)
            .innerJoin(
              organizationTable,
              eq(organizationTable.id, memberTable.organizationId),
            )
            .where(eq(memberTable.userId, user.id));
          return organizations.map((org) => org.slug);
        },
        definePayload: () => ({
          role: 'authenticated',
        }),
        expirationTime: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log(
            `Sending invitation email to ${data.email} for organization ${data.organization.name}`,
          );
        }
        const inviteLink = `${appEnvVariables.VITE_APP_URL}/accept-invitation/${data.id}`;
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
      ac,
      roles,
    }),
  ],
  user: {
    additionalFields: {},
  },
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
  },
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session'];

export { authMiddleware } from './middleware.ts';
