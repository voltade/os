import { existsSync, readdirSync } from 'node:fs';
import { zValidator } from '@hono/zod-validator';
import { cors } from 'hono/cors';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { appInstallations } from '#server/index.ts';
import { auth } from '#server/middlewares/auth.ts';
import { getAppEnvs, getPgrestUrl } from '#server/utils/env/index.ts';
import { downloadPackage } from '#server/utils/package/index.ts';
import {
  createWorker,
  deleteWorker,
  getWorker,
} from '#server/utils/worker/index.ts';

export const routes = factory
  .createApp()
  .put(
    '/update/:appSlug',
    auth,
    zValidator(
      'json',
      z.object({
        buildId: z.string(),
      }),
    ),
    zValidator(
      'param',
      z.object({
        appSlug: z.string(),
      }),
    ),
    async (c) => {
      const { appSlug } = c.req.valid('param');
      const { buildId } = c.req.valid('json');

      const oldBuildId = appInstallations.get(appSlug);

      if (oldBuildId) {
        deleteWorker(appSlug, oldBuildId);
      }

      appInstallations.set(appSlug, buildId);

      console.log(appInstallations);

      return c.json({ message: 'Build updated', buildId });
    },
  )
  .all(
    '/:appSlug/*',
    cors(),
    zValidator(
      'param',
      z.object({
        appSlug: z.string(),
      }),
    ),
    async (c) => {
      const { appSlug } = c.req.valid('param');

      const buildId = appInstallations.get(appSlug);

      if (!buildId) {
        return c.json({ error: 'Build not found' }, 404);
      }

      const truncatedBuildId = buildId.slice(0, 8);
      const workerPath = `${c.env.NODE_ENV === 'development' ? process.cwd() : '/tmp'}/data/${appSlug}-${truncatedBuildId}`;

      console.log(workerPath);

      let worker = getWorker(appSlug, truncatedBuildId);

      if (!worker) {
        const folderExists =
          existsSync(workerPath) && readdirSync(workerPath).length > 0;

        if (!folderExists) {
          await downloadPackage(
            {
              orgId: c.env.ORGANIZATION_ID,
              appSlug,
              buildId,
            },
            workerPath,
          );
        }

        const envs = await getAppEnvs(
          c.env.ORGANIZATION_ID,
          c.env.ENVIRONMENT_ID,
        );

        console.log(c.req.raw.headers.get('origin'));

        worker = await createWorker(appSlug, truncatedBuildId, workerPath, {
          ...envs,
          DB_USER: c.env.DB_USER_AUTHENTICATOR,
          DB_PASSWORD: c.env.DB_PASSWORD_AUTHENTICATOR,
          DB_HOST: c.env.DB_HOST,
          DB_PORT: c.env.DB_PORT,
          DB_NAME: c.env.DB_NAME,
          VITE_PGREST_URL: getPgrestUrl({
            orgSlug: c.env.ORGANIZATION_SLUG,
            envSlug: c.env.ENVIRONMENT_SLUG,
          }),
          PLATFORM_URL: c.env.PLATFORM_URL,
          VITE_PLATFORM_URL: c.env.VITE_PLATFORM_URL,
          RUNNER_KEY: c.env.RUNNER_KEY, //TODO: CHECK IF THIS IS NEEDED
          ORGANIZATION_ID: c.env.ORGANIZATION_ID,
          ORGANIZATION_SLUG: c.env.ORGANIZATION_SLUG,
          ENVIRONMENT_ID: c.env.ENVIRONMENT_ID,
          ENVIRONMENT_SLUG: c.env.ENVIRONMENT_SLUG,
          PUBLIC_KEY: c.env.PUBLIC_KEY,
        });
      }

      const reqUrl = c.req.url.replace(`/apps/${appSlug}`, '');

      try {
        const response = await fetch(reqUrl, {
          unix: `${workerPath}/server.sock`,
          method: c.req.method,
          body: c.req.raw.body,
          headers: c.req.raw.headers,
        });

        return response;
      } catch (error) {
        const errorMsg = `Error proxying to worker for ${appSlug}: ${error}`;
        console.info(appSlug, 'error', errorMsg);
        console.error(errorMsg);
        return c.text('Worker communication error', 500);
      }
    },
  );
