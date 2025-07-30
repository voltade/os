import { existsSync, readdirSync } from 'node:fs';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { factory } from '#server/factory.ts';
import { getAppEnvs } from '#server/utils/env/index.ts';
import { downloadPackage } from '#server/utils/package/index.ts';
import { createWorker, getWorker } from '#server/utils/worker/index.ts';

export const routes = factory.createApp().all(
  '/:appId/:releaseId/*',
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

    let worker = getWorker(appId, truncatedReleaseId);

    if (!worker) {
      const folderExists =
        existsSync(workerPath) && readdirSync(workerPath).length > 0;

      if (!folderExists) {
        await downloadPackage(c.env.ORG_ID, appId, releaseId, workerPath);
      }

      const envs = await getAppEnvs(c.env.ORG_ID, appId, c.env.OS_URL);
      worker = await createWorker(appId, truncatedReleaseId, workerPath, envs);
    }

    const reqUrl = c.req.url.replace(`/api/apps/${appId}/${releaseId}`, '');

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
