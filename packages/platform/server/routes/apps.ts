import { zValidator } from '@hono/zod-validator';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { appBuildTable } from '#drizzle/app_build.ts';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import {
  type BuildJobOptions,
  createBuildJob,
} from '#server/lib/kubernetes/build/job.ts';
import { getK8sObjectClient } from '#server/lib/kubernetes/kubeapi.ts';

export const route = factory
  .createApp()
  .get(
    '/builds',
    zValidator(
      'query',
      z.object({
        appId: z.string(),
        orgId: z.string(),
        limit: z.coerce.number().min(1).max(100).default(20),
        offset: z.coerce.number().min(0).default(0),
      }),
    ),
    async (c) => {
      const { appId, orgId, limit, offset } = c.req.valid('query');

      const builds = await db
        .select()
        .from(appBuildTable)
        .where(
          and(eq(appBuildTable.app_id, appId), eq(appBuildTable.org_id, orgId)),
        )
        .orderBy(desc(appBuildTable.created_at))
        .limit(limit)
        .offset(offset);

      return c.json(builds);
    },
  )
  .get(
    '/builds/:buildId',
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
    async (c) => {
      const { buildId } = c.req.valid('param');
      const { appId, orgId } = c.req.valid('query');

      const build = await db.query.appBuildTable.findFirst({
        where: and(
          eq(appBuildTable.id, buildId),
          eq(appBuildTable.app_id, appId),
          eq(appBuildTable.org_id, orgId),
        ),
      });

      if (!build) {
        return c.json({ error: 'Build not found' }, 404);
      }

      return c.json(build);
    },
  )
  .post(
    '/build',
    zValidator(
      'json',
      z.object({
        appId: z.string(),
        orgId: z.string(),
      }),
    ),
    async (c) => {
      const { appId, orgId } = c.req.valid('json');

      // Find the app
      const app = await db.query.appTable.findFirst({
        where: and(eq(appTable.id, appId), eq(appTable.org_id, orgId)),
      });

      console.log('app', app);

      if (!app) {
        return c.json({ error: 'App not found' }, 404);
      }

      let buildRecord: typeof appBuildTable.$inferSelect | undefined;
      try {
        // Create build record
        const [newBuildRecord] = await db
          .insert(appBuildTable)
          .values({
            app_id: appId,
            org_id: orgId,
            status: 'pending',
          })
          .returning();

        buildRecord = newBuildRecord;
        const buildId = buildRecord.id;

        // Prepare Kubernetes client
        const k8sConfig = {
          cluster: {
            name: appEnvVariables.CLUSTER_NAME,
            server: appEnvVariables.CLUSTER_SERVER,
            skipTLSVerify: appEnvVariables.CLUSTER_SKIP_TLS_VERIFY,
            caData: appEnvVariables.CLUSTER_CA_DATA,
          },
          user: {
            name: appEnvVariables.USER_NAME,
            token: appEnvVariables.USER_TOKEN,
          },
          context: {
            name: 'default',
            cluster: appEnvVariables.CLUSTER_NAME,
            user: appEnvVariables.USER_NAME,
          },
        };

        const k8sClient = getK8sObjectClient({
          env:
            appEnvVariables.NODE_ENV === 'development'
              ? 'development'
              : 'production',
          config: k8sConfig,
        });

        // Update build status to building
        await db
          .update(appBuildTable)
          .set({ status: 'building' })
          .where(
            and(
              eq(appBuildTable.id, buildId),
              eq(appBuildTable.app_id, appId),
              eq(appBuildTable.org_id, orgId),
            ),
          );

        // Create and submit build job
        const jobOptions: BuildJobOptions = {
          resources: {},
          enableS3Upload: true, // S3 config will be injected from secrets
          // statusCallbackUrl: `http://socat.platform:5173/api/apps/builds/${buildId}/status`,
        };

        await createBuildJob(k8sClient, app, buildId, jobOptions);

        return c.json({
          success: true,
          buildId,
          message: 'Build started successfully',
          app: {
            id: app.id,
            slug: app.slug,
            git_repo_url: app.git_repo_url,
            git_repo_branch: app.git_repo_branch,
            git_repo_path: app.git_repo_path,
            build_command: app.build_command,
            output_path: app.output_path,
          },
        });
      } catch (error) {
        console.error('Build creation failed:', error);

        // Try to update build status to error if we have a build record
        if (buildRecord?.id) {
          try {
            await db
              .update(appBuildTable)
              .set({ status: 'error' })
              .where(
                and(
                  eq(appBuildTable.id, buildRecord.id),
                  eq(appBuildTable.app_id, appId),
                  eq(appBuildTable.org_id, orgId),
                ),
              );
          } catch (dbError) {
            console.error('Failed to update build status to error:', dbError);
          }
        }

        return c.json(
          {
            error: 'Failed to start build',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          500,
        );
      }
    },
  )
  .patch(
    '/builds/:buildId/status',
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
        logs: z.string().optional(),
      }),
    ),
    async (c) => {
      const { buildId } = c.req.valid('param');
      const { appId, orgId, status, logs } = c.req.valid('json');

      // Verify build exists and belongs to the org/app
      const existingBuild = await db.query.appBuildTable.findFirst({
        where: and(
          eq(appBuildTable.id, buildId),
          eq(appBuildTable.app_id, appId),
          eq(appBuildTable.org_id, orgId),
        ),
      });

      if (!existingBuild) {
        return c.json({ error: 'Build not found' }, 404);
      }

      // Update build status
      const [updatedBuild] = await db
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
            eq(appBuildTable.org_id, orgId),
          ),
        )
        .returning();

      // Log for debugging
      console.log(`Build ${buildId} status updated to ${status}`, {
        logs: logs ? `${logs.length} characters` : 'none',
      });

      return c.json({
        success: true,
        build: updatedBuild,
      });
    },
  );
