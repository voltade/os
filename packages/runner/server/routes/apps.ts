import { existsSync, readdirSync } from 'node:fs';
import { zValidator } from '@hono/zod-validator';
import { cors } from 'hono/cors';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { getAppEnvs, getAppEnvsFromK8s } from '#server/utils/env/index.ts';
import { downloadPackage } from '#server/utils/package/index.ts';
import { createWorker, getWorker } from '#server/utils/worker/index.ts';

export const routes = factory.createApp().all(
  '/:appId/:releaseId/*',
  cors(),
  zValidator(
    'param',
    z.object({
      appId: z.string(),
      releaseId: z.string(),
    }),
  ),
  async (c) => {
    const { appId, releaseId } = c.req.valid('param');
    const truncatedReleaseId = releaseId.slice(0, 8);
    const workerPath = `${c.env.NODE_ENV === 'development' ? process.cwd() : '/tmp'}/data/${appId}-${truncatedReleaseId}`;

    console.log(workerPath);

    let worker = getWorker(appId, truncatedReleaseId);

    if (!worker) {
      const folderExists =
        existsSync(workerPath) && readdirSync(workerPath).length > 0;

      if (!folderExists) {
        await downloadPackage(
          {
            orgId: c.env.ORGANIZATION_ID,
            appId,
            releaseId,
          },
          workerPath,
        );
      }

      const envs = await getAppEnvs(
        c.env.ORGANIZATION_ID,
        c.env.ENVIRONMENT_ID,
        {
          RUNNER_SECRET_TOKEN: c.env.RUNNER_SECRET_TOKEN,
          platformUrl: c.env.PLATFORM_URL,
        },
      );

      const k8sEnvs = await getAppEnvsFromK8s();

      console.log(c.req.raw.headers.get('origin'));

      worker = await createWorker(appId, truncatedReleaseId, workerPath, {
        VITE_APP_URL: `${c.req.raw.headers.get('origin')}/${appId}/${releaseId}`,
        ...envs,
        ...k8sEnvs,
      });
    }

    const reqUrl = c.req.url.replace(`/apps/${appId}/${releaseId}`, '');

    try {
      const response = await fetch(reqUrl, {
        unix: `${workerPath}/server.sock`,
        method: c.req.method,
        body: c.req.raw.body,
      });

      return response;
    } catch (error) {
      const errorMsg = `Error proxying to worker for ${appId}: ${error}`;
      console.info(appId, 'error', errorMsg);
      console.error(errorMsg);
      return c.text('Worker communication error', 500);
    }
  },
);
