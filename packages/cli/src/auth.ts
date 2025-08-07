import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { Command } from 'commander';

import { clearAuth, isTokenValid, setAuthData } from './utils/config.js';

// OAuth Types
interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token: string;
}

interface AuthData {
  access_token: string;
  expires_in: number;
  expires_at: number;
  id_token: string;
}

interface AuthResult {
  error?: string;
  authData?: AuthData;
}

interface AuthorizationUrlParams {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  [key: string]: string; // Index signature for URLSearchParams compatibility
}

const BASE_URL = 'http://127.0.0.1.nip.io';
const CALLBACK_PORT = 8080;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

export const authCommand = new Command('auth')
  .description('Authentication commands')
  .addCommand(
    new Command('login').description('Login to Voltade').action(async () => {
      try {
        // Check if already authenticated
        if (await isTokenValid()) {
          console.log('✅ Already authenticated and token is valid');
          return;
        }

        await authenticateWithOIDC();
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

async function authenticateWithOIDC() {
  console.log('🔐 Starting Voltade authentication...');

  // Start local callback server
  const { server, authorizationPromise } = createCallbackServer();

  try {
    // Generate OIDC authorization URL
    const authUrl = generateAuthorizationUrl();

    console.log('\n📱 Opening browser for authentication...');
    console.log(`If the browser doesn't open, visit: ${authUrl}\n`);

    // Open browser to auth URL
    await openBrowser(authUrl);

    // Wait for callback
    console.log('⏳ Waiting for authentication callback...');
    const authResult = await authorizationPromise;

    if (authResult.error) {
      throw new Error(`Authentication error: ${authResult.error}`);
    }

    console.log('✅ Authentication successful!');
    if (authResult.authData) {
      await setAuthData(authResult.authData);
      console.log('\n💾 Authentication data saved to config');
    }
  } finally {
    server.close();
  }
}

function generateAuthorizationUrl(): string {
  const params: AuthorizationUrlParams = {
    response_type: 'code',
    client_id: 'cli', // This should match your OIDC client configuration
    redirect_uri: CALLBACK_URL,
    scope: 'openid profile email',
    state: Math.random().toString(36).substring(2, 15),
  };

  return `${BASE_URL}/api/auth/oauth2/authorize?${new URLSearchParams(params).toString()}`;
}

function createCallbackServer() {
  let resolveAuth: (result: AuthResult) => void;

  const authorizationPromise = new Promise<AuthResult>((resolve) => {
    resolveAuth = resolve;
  });

  const server = createServer(async (req, res) => {
    if (req.url?.startsWith('/callback')) {
      const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h1>Authentication Error</h1><p>${error}</p>`);
        resolveAuth({ error });
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Error</h1><p>No authorization code received</p>');
        resolveAuth({ error: 'No authorization code received' });
        return;
      }

      try {
        // Exchange code for tokens using better-auth endpoint
        const tokenResponse = await fetch(`${BASE_URL}/api/auth/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: CALLBACK_URL,
            client_id: 'cli',
            client_secret: 'VvrMhfMJBjDHMDWNTetIQGkNykfrmPfb', // DO NOT CHANGE THIS SECRET
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(
            `Token exchange failed: ${tokenResponse.statusText} - ${errorText}`,
          );
        }

        const tokens: OAuthTokenResponse = await tokenResponse.json();

        // Extract and persist only essential auth data
        const authData: AuthData = {
          access_token: tokens.access_token,
          expires_in: tokens.expires_in,
          expires_at: Date.now() + tokens.expires_in * 1000, // Calculate absolute expiry
          id_token: tokens.id_token,
        };

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <h1>✅ Authentication Successful!</h1>
          <p>You can close this window and return to the CLI.</p>
          <script>setTimeout(() => window.close(), 5000);</script>
        `);

        resolveAuth({ authData });
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error</h1><p>${error}</p>`);
        resolveAuth({ error: String(error) });
      }
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(CALLBACK_PORT, 'localhost');
  console.log(
    `🌐 Callback server started on http://localhost:${CALLBACK_PORT}`,
  );

  return { server, authorizationPromise };
}

async function openBrowser(url: string): Promise<void> {
  return new Promise((resolve) => {
    let command: string;
    let args: string[];

    // Cross-platform browser opening
    switch (process.platform) {
      case 'darwin':
        command = 'open';
        args = [url];
        break;
      case 'win32':
        command = 'start';
        args = ['', url];
        break;
      default:
        command = 'xdg-open';
        args = [url];
        break;
    }

    const child = spawn(command, args, { detached: true, stdio: 'ignore' });
    child.unref();

    child.on('error', (error) => {
      console.warn('Failed to open browser automatically:', error.message);
      resolve(); // Don't fail the auth process
    });

    child.on('close', () => {
      resolve();
    });
  });
}
