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
      this.authClient = this.initAuthClient();
    }
    if (!this.honoClient) {
      this.honoClient = await this.initHonoClient();
    }
  }

  protected authClient!: Awaited<ReturnType<BaseCommand['initAuthClient']>>;
  private initAuthClient() {
    const { dataDir } = this.config;
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
    return client;
  }

  protected honoClient!: Awaited<ReturnType<BaseCommand['initHonoClient']>>;
  private async initHonoClient() {
    const { dataDir } = this.config;
    const cookies = await loadCookies(dataDir);
    const { api } = hc<AppType>(BaseUrl, {
      init: {
        headers: cookies
          ? {
              'content-type': 'application/json',
              cookie: cookies?.join('; '),
            }
          : {
              'content-type': 'application/json',
            },
      },
    });
    return api;
  }
}
