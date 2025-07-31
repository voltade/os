import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt, openAPI, organization } from 'better-auth/plugins';

import { appEnvVariables } from '#server/env.ts';
import { db } from '#server/lib/db.ts';
import { mailer } from '#server/lib/mailer.ts';

// https://www.better-auth.com/docs/reference/options
export const auth = betterAuth({
  appName: 'Voltade OS',
  baseURL: `${appEnvVariables.VITE_APP_URL}/api/auth`,
  trustedOrigins: [appEnvVariables.VITE_APP_URL],
  secret: appEnvVariables.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, token }) => {
      await mailer.sendMail({
        to: user.email,
        subject: 'Verify your email',
        text: `Your verification code is: ${token}`,
      });
    },
  },
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    openAPI({
      path: '/docs',
    }),
    jwt(),
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
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session'];
