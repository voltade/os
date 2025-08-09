import { input } from '@inquirer/prompts';
import { Command } from 'commander';

import { clearAuth, isTokenValid, setAuthData } from './utils/config.js';

const BASE_URL = 'http://127.0.0.1.nip.io';

export const authCommand = new Command('auth')
  .description('Authentication commands')
  .addCommand(
    new Command('login').description('Login to Voltade').action(async () => {
      try {
        if (await isTokenValid()) {
          console.log('✅ Already authenticated and token is valid');
          return;
        }

        await authenticateWithBetterAuth();
      } catch (error) {
        console.error('Authentication failed:', error);
        process.exit(1);
      }
    }),
  )
  .addCommand(
    new Command('logout')
      .description('Logout from Voltade')
      .action(async () => {
        await clearAuth();
        console.log('✅ Logged out from Voltade');
      }),
  );

async function authenticateWithBetterAuth() {
  console.log('🔐 Sign in via email OTP');

  const email = await input({ message: 'Email:' });

  const sendRes = await fetch(
    `${BASE_URL}/api/auth/email-otp/send-verification-otp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, type: 'sign-in' }),
    },
  );
  if (!sendRes.ok) {
    const t = await sendRes.text();
    throw new Error(`Failed to send OTP: ${sendRes.status} ${t}`);
  }

  const otp = await input({ message: 'Verification code:' });

  const verifyRes = await fetch(`${BASE_URL}/api/auth/sign-in/email-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  if (!verifyRes.ok) {
    const t = await verifyRes.text();
    throw new Error(`OTP verification failed: ${verifyRes.status} ${t}`);
  }

  // Better Auth sets session via Set-Cookie; also with jwt plugin, a header 'set-auth-jwt' may be present
  const sessionToken = extractSessionTokenFromHeaders(verifyRes.headers);
  if (!sessionToken) {
    // Fallback: try to get JWT header if configured
    const jwt = verifyRes.headers.get('set-auth-jwt');
    if (jwt) {
      // Store jwt as session token for bearer auth on API
      await setAuthData({
        session_token: jwt,
        session_expires_at: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30d best-effort
      });
      console.log('✅ Logged in (JWT)');
      return;
    }
    throw new Error('No session token found in response');
  }

  // Attempt to fetch session to get expiry and confirm login
  const sessionRes = await fetch(`${BASE_URL}/api/auth/get-session`, {
    headers: { Cookie: `better-auth.session_token=${sessionToken}` },
  });
  if (!sessionRes.ok) {
    const t = await sessionRes.text();
    throw new Error(`Failed to retrieve session: ${sessionRes.status} ${t}`);
  }
  const sessionJson = await sessionRes.json();
  const expiresAt =
    typeof sessionJson?.session?.expiresAt === 'number'
      ? sessionJson.session.expiresAt
      : Date.now() + 1000 * 60 * 60 * 24 * 30;

  await setAuthData({
    session_token: sessionToken,
    session_expires_at: expiresAt,
  });
  console.log('✅ Logged in');
}

function extractSessionTokenFromHeaders(headers: Headers): string | null {
  // Try Bun/Undici specific helper first
  const anyHeaders = headers as unknown as { getSetCookie?: () => string[] };
  const setCookieList = anyHeaders.getSetCookie?.();
  if (Array.isArray(setCookieList) && setCookieList.length > 0) {
    for (const cookie of setCookieList) {
      const match =
        /(^|\s)(better-auth\.session_token|ba_session)=([^;]+)/.exec(cookie);
      const token = match?.[3];
      if (token) return token;
    }
  }
  // Fallback to single header and manual split
  const setCookieHeader = headers.get('set-cookie') || '';
  const cookies = setCookieHeader.split(/,(?=[^;]+=)/);
  for (const cookie of cookies) {
    const match = /(^|\s)(better-auth\.session_token|ba_session)=([^;]+)/.exec(
      cookie,
    );
    const token = match?.[3];
    if (token) return token;
  }
  return null;
}
