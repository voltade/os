import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { appBuildTable } from '#drizzle/app_build.ts';
import { factory } from '#server/factory.ts';
import { s3Client } from '#server/lib/s3.ts';
import { auth } from '#server/middlewares/auth.ts';
import { drizzle } from '#server/middlewares/drizzle.ts';

export const route = factory
  .createApp()
  .use(auth())
  .post(
    '/s3/signed_url',
    zValidator(
      'json',
      z.object({
        type: z.enum(['source', 'builds']).default('source'),
        appId: z.string(),
        orgId: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { type, appId, orgId } = c.req.valid('json');
      const { tx } = c.var;

      const app = await tx.query.appTable.findFirst({
        where: and(eq(appTable.id, appId), eq(appTable.organization_id, orgId)),
      });

      if (!app) {
        return c.json({ error: 'App not found' }, 404);
      }

      const [appBuild] = await tx
        .insert(appBuildTable)
        .values({
          app_id: appId,
          organization_id: orgId,
          status: 'pending',
        })
        .returning();

      if (!appBuild) {
        return c.json({ error: 'Failed to create build' }, 500);
      }

      const uploadUrl = s3Client.presign(
        type === 'source'
          ? `/source/${orgId}/${app.slug}/${appBuild.id}.zip`
          : `/builds/${orgId}/${app.slug}/${appBuild.id}/artifact.tar.gz`,
        {
          method: 'PUT',
          expiresIn: 3600,
          type: 'application/zip',
        },
      );

      return c.json({ uploadUrl, appBuild });
    },
  )
  .patch(
    '/:buildId/status',
    zValidator(
      'param',
      z.object({
        buildId: z.string(),
      }),
    ),
    zValidator(
      'json',
      z.object({
        appId: z.string(),
        orgId: z.string(),
        status: z.enum(['pending', 'building', 'ready', 'error']),
      }),
    ),
    drizzle(),
    async (c) => {
      const { buildId } = c.req.valid('param');
      const { appId, orgId, status } = c.req.valid('json');
      const { tx } = c.var;

      // Verify build exists and belongs to the org/app
      const existingBuild = await tx.query.appBuildTable.findFirst({
        where: and(
          eq(appBuildTable.id, buildId),
          eq(appBuildTable.app_id, appId),
          eq(appBuildTable.organization_id, orgId),
        ),
      });

      if (!existingBuild) {
        return c.json({ error: 'Build not found' }, 404);
      }

      // Update build status
      const [updatedBuild] = await tx
        .update(appBuildTable)
        .set({
          status,
          // Add logs and artifact URL if provided (extend schema as needed)
          updated_at: new Date(),
        })
        .where(
          and(
            eq(appBuildTable.id, buildId),
            eq(appBuildTable.app_id, appId),
            eq(appBuildTable.organization_id, orgId),
          ),
        )
        .returning();

      return c.json({
        success: true,
        build: updatedBuild,
      });
    },
  )
  .get(
    '/:buildId',
    zValidator(
      'param',
      z.object({
        buildId: z.string(),
      }),
    ),
    zValidator(
      'query',
      z.object({
        appId: z.string(),
        orgId: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { buildId } = c.req.valid('param');
      const { appId, orgId } = c.req.valid('query');
      const { tx } = c.var;

      const build = await tx.query.appBuildTable.findFirst({
        where: and(
          eq(appBuildTable.id, buildId),
          eq(appBuildTable.app_id, appId),
          eq(appBuildTable.organization_id, orgId),
        ),
      });

      if (!build) {
        return c.json({ error: 'Build not found' }, 404);
      }

      return c.json(build);
    },
  )
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        appId: z.string(),
        orgId: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { appId, orgId } = c.req.valid('query');
      const { tx } = c.var;

      const builds = await tx.query.appBuildTable.findMany({
        where: and(
          eq(appBuildTable.app_id, appId),
          eq(appBuildTable.organization_id, orgId),
        ),
      });

      return c.json(builds);
    },
  );
