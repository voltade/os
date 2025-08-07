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
import { createRemoteJWKSet, jwtVerify } from 'jose';

import {
  member as memberTable,
  organization as organizationTable,
} from '#drizzle/auth.ts';
import { appEnvVariables, type Oauth2Payload } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { mailer } from '#server/lib/mailer.ts';
import { nanoid } from '#server/lib/nanoid.ts';

const BASE_URL = `${appEnvVariables.VITE_APP_URL}/api/auth`;

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

async function validateToken(token: string): Promise<Oauth2Payload> {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${BASE_URL}/jwks`));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: BASE_URL.replace('/api/auth', ''),
      audience: [BASE_URL, 'cli'],
    });
    return payload as Oauth2Payload;
  } catch (error) {
    console.error('Token validation failed:', error);
    throw error;
  }
}

export const authMiddleware = (force: boolean = false) =>
  factory.createMiddleware(async (c, next) => {
    const authHeader = c.req.raw.headers.get('Authorization') || '';
    const maybeToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : undefined;

    // 1) Static Bearer token(s)
    if (maybeToken) {
      const staticTokens = appEnvVariables.ARGOCD_ENVIRONMENT_GENERATOR_TOKEN
        ? [appEnvVariables.ARGOCD_ENVIRONMENT_GENERATOR_TOKEN]
        : [];
      if (staticTokens.length > 0 && staticTokens.includes(maybeToken)) {
        c.set('oauth2', null);
        c.set('user', null);
        c.set('session', null);
        c.set('authType', 'static');
        return next();
      }
    }

    // 2) JWT Bearer token (OIDC/JWK verified)
    if (maybeToken) {
      try {
        const payload = await validateToken(maybeToken);
        c.set('oauth2', payload);
        c.set('authType', 'jwt');
        return next();
      } catch {
        console.log('Token validation failed:', maybeToken);
      }
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (force && !session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    if (!session) {
      c.set('user', null);
      c.set('session', null);
      c.set('authType', 'none');
      return next();
    }
    c.set('user', session.user);
    c.set('session', session.session);
    c.set('authType', 'session');
    return next();
  });
