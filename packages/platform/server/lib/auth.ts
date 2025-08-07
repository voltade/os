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
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { mailer } from '#server/lib/mailer.ts';
import { nanoid } from '#server/lib/nanoid.ts';

// https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
  appName: 'Voltade OS',
  baseURL: `${appEnvVariables.VITE_APP_URL}/api/auth`,
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
      trustedClients: [
        {
          clientId: 'cli',
          type: 'web',
          redirectURLs: ['http://localhost:8080/callback'],
          skipConsent: true,
          clientSecret: 'VvrMhfMJBjDHMDWNTetIQGkNykfrmPfb',
          name: 'Voltade CLI',
          metadata: {},
          disabled: false,
        },
      ],
      accessTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days
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
    organization(),
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

export const authMiddleware = (force: boolean = false) =>
  factory.createMiddleware(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (force && !session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    if (!session) {
      c.set('user', null);
      c.set('session', null);
      return next();
    }
    c.set('user', session.user);
    c.set('session', session.session);
    return next();
  });
