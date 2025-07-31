import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt, openAPI, organization } from 'better-auth/plugins';

import { appEnvVariables } from '#server/env.ts';
import { db } from '#server/lib/db.ts';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  baseURL: `${appEnvVariables.VITE_APP_URL}/api/auth`,
  secret: appEnvVariables.AUTH_SECRET,

  plugins: [
    openAPI({
      path: '/docs',
    }),
    jwt(),
    organization(),
  ],

  onAPIError: {
    throw: true,
    onError: (error) => {
      console.error('Auth error:', error);
    },
  },
  trustedOrigins: [appEnvVariables.VITE_APP_URL],

  emailAndPassword: {
    enabled: true,
  },

  // Reference: https://www.better-auth.com/docs/reference/options#user
  user: {
    additionalFields: {},
  },
});

export type Auth = typeof auth;
export type Session = Auth['$Infer']['Session'];
