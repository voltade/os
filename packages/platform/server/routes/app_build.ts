import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import { appBuildTable } from '#drizzle/app_build.ts';
import { platformEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import {
  type BuildJobOptions,
  createBuildJob,
} from '#server/lib/kubernetes/build/job.ts';
import { getK8sObjectClient } from '#server/lib/kubernetes/kubeapi.ts';
import { s3Client } from '#server/lib/s3.ts';
import { auth } from '#server/middlewares/auth.ts';
import { drizzle } from '#server/middlewares/drizzle.ts';

export const route = factory
  .createApp()
  .use(auth())
  .post(
    '/git',
    zValidator(
      'json',
      z.object({
        appId: z.string(),
        orgId: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { appId, orgId } = c.req.valid('json');
      const { tx } = c.var;

      // Find the app
      const app = await tx.query.appTable.findFirst({
        where: and(eq(appTable.id, appId), eq(appTable.organization_id, orgId)),
      });

      if (!app) {
        return c.json({ error: 'App not found' }, 404);
      }

      let buildRecord: typeof appBuildTable.$inferSelect | undefined;
      try {
        // Create build record
        const [newBuildRecord] = await tx
          .insert(appBuildTable)
          .values({
            app_id: appId,
            organization_id: orgId,
            status: 'pending',
          })
          .returning();

        if (!newBuildRecord) {
          return c.json({ error: 'Failed to create build' }, 500);
        }

        buildRecord = newBuildRecord;
        const buildId = buildRecord.id;

        // Prepare Kubernetes client
        const k8sConfig = {
          cluster: {
            name: platformEnvVariables.CLUSTER_NAME,
            server: platformEnvVariables.CLUSTER_SERVER,
            skipTLSVerify: platformEnvVariables.CLUSTER_SKIP_TLS_VERIFY,
            caData: platformEnvVariables.CLUSTER_CA_DATA,
          },
          user: {
            name: platformEnvVariables.USER_NAME,
            token: platformEnvVariables.USER_TOKEN,
          },
          context: {
            name: 'default',
            cluster: platformEnvVariables.CLUSTER_NAME,
            user: platformEnvVariables.USER_NAME,
          },
        };

        const k8sClient = getK8sObjectClient({
          env:
            platformEnvVariables.NODE_ENV === 'development'
              ? 'development'
              : 'production',
          config: k8sConfig,
        });

        // Update build status to building
        await tx
          .update(appBuildTable)
          .set({ status: 'building' })
          .where(
            and(
              eq(appBuildTable.id, buildId),
              eq(appBuildTable.app_id, appId),
              eq(appBuildTable.organization_id, orgId),
            ),
          );

        // Create and submit build job
        const jobOptions: BuildJobOptions = {
          resources: {},
          enableS3Upload: true, // S3 config will be injected from secrets
          statusCallbackUrl: `http://socat.platform:5173/api/app_build/${buildId}/status`,
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
            await tx
              .update(appBuildTable)
              .set({ status: 'error' })
              .where(
                and(
                  eq(appBuildTable.id, buildRecord.id),
                  eq(appBuildTable.app_id, appId),
                  eq(appBuildTable.organization_id, orgId),
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
  .post(
    '/s3',
    zValidator(
      'json',
      z.object({
        orgId: z.string(),
        appId: z.string(),
        buildId: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { appId, orgId, buildId } = c.req.valid('json');
      const { tx } = c.var;

      const appBuild = await tx.query.appBuildTable.findFirst({
        where: and(
          eq(appBuildTable.id, buildId),
          eq(appBuildTable.app_id, appId),
          eq(appBuildTable.organization_id, orgId),
        ),
      });
      if (!appBuild) {
        return c.json({ error: 'Build not found' }, 404);
      }

      await tx
        .update(appBuildTable)
        .set({
          status: 'building',
        })
        .where(eq(appBuildTable.id, buildId));

      // Find the app, needed for job
      const app = await tx.query.appTable.findFirst({
        where: and(eq(appTable.id, appId), eq(appTable.organization_id, orgId)),
      });
      if (!app) {
        return c.json({ error: 'App not found' }, 404);
      }

      // Prepare Kubernetes client (reuse config from /git route)
      const k8sConfig = {
        cluster: {
          name: platformEnvVariables.CLUSTER_NAME,
          server: platformEnvVariables.CLUSTER_SERVER,
          skipTLSVerify: platformEnvVariables.CLUSTER_SKIP_TLS_VERIFY,
          caData: platformEnvVariables.CLUSTER_CA_DATA,
        },
        user: {
          name: platformEnvVariables.USER_NAME,
          token: platformEnvVariables.USER_TOKEN,
        },
        context: {
          name: 'default',
          cluster: platformEnvVariables.CLUSTER_NAME,
          user: platformEnvVariables.USER_NAME,
        },
      } as const;

      const k8sClient = getK8sObjectClient({
        env:
          platformEnvVariables.NODE_ENV === 'development'
            ? 'development'
            : 'production',
        config: k8sConfig,
      });

      // Build will use S3 source zip we asked the client to upload earlier
      const s3SourceKey = `source/${orgId}/${app.slug}/${buildId}.zip`;

      const jobOptions: BuildJobOptions = {
        resources: {},
        enableS3Upload: true, // keep artifact upload
        statusCallbackUrl: `http://socat.platform:5173/api/app_build/${buildId}/status`,
        s3SourceKey,
      };

      await createBuildJob(k8sClient, app, buildId, jobOptions);

      return c.json({ success: true, buildId });
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
