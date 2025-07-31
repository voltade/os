import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  apiKey,
  bearer,
  emailOTP,
  jwt,
  openAPI,
  organization,
} from 'better-auth/plugins';

import { appEnvVariables } from '#server/env.ts';
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
