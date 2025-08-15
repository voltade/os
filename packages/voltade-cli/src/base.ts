import fs from 'node:fs/promises';
import { Command } from '@oclif/core';
import type { AppType } from '@voltade/platform/types';
import { createAuthClient } from 'better-auth/client';
import { emailOTPClient, organizationClient } from 'better-auth/client/plugins';
import { hc } from 'hono/client';
import type { Ora } from 'ora';
import ora from 'ora';

import { loadCookies, saveCookies } from '#src/utils/cookies.ts';

const BaseUrl = 'http://127.0.0.1.nip.io';

export abstract class BaseCommand extends Command {
  spinner!: Ora;

  override async init() {
    await super.init();
    this.spinner = ora();
    const { dataDir } = this.config;
    if ((await fs.exists(dataDir)) === false) {
      await fs.mkdir(dataDir, { recursive: true });
    }
    if (!this.authClient) {
      console.log('Initializing auth client...');
      this.authClient = await this.initAuthClient();
      console.log('Auth client set.');
    }
    if (!this.honoClient) {
      console.log('Initializing Hono client...');
      this.honoClient = await this.initHonoClient();
      console.log('Hono client set.');
    }
  }

  authClient!: Awaited<ReturnType<BaseCommand['initAuthClient']>>;
  async initAuthClient() {
    const { dataDir } = this.config;

    console.log('Initializing auth client...');
    const client = createAuthClient({
      baseURL: `${BaseUrl}/api/auth`,
      fetchOptions: {
        credentials: 'omit',
        onRequest: async (context) => {
          const cookies = await loadCookies(dataDir);
          if (cookies) {
            for (const cookie of cookies) {
              context.headers.append('cookie', cookie);
            }
          }
          return context;
        },
        onResponse: async (context) => {
          const cookies = context.response.headers.getSetCookie();
          if (cookies && cookies.length > 0) {
            await saveCookies(dataDir, cookies);
          }
          return context;
        },
      },
      plugins: [emailOTPClient(), organizationClient()],
    });
    console.log('Auth client initialized.');
    return client;
  }

  honoClient!: Awaited<ReturnType<BaseCommand['initHonoClient']>>;
  async initHonoClient() {
    const { dataDir } = this.config;
    const cookies = await loadCookies(dataDir);
    if (!cookies) {
      throw new Error('No cookies found. Please login first.');
    }
    console.log('Initializing Hono client...');
    const { api } = hc<AppType>(BaseUrl, {
      init: {
        headers: {
          cookie: cookies.join('; '),
        },
      },
    });
    console.log('Hono client initialized.');

    return api;
  }
}
