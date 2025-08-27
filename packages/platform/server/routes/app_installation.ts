import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { appTable } from '#drizzle/app.ts';
import {
  appInstallationSchema,
  appInstallationTable,
} from '#drizzle/app_installation.ts';
import { organization as organizationTable } from '#drizzle/auth.ts';
import { environmentTable } from '#drizzle/environment.ts';
import { BASE_DOMAIN } from '#server/const.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { signJwt } from '#server/lib/jwt.ts';
import { auth } from '#server/middlewares/auth.ts';
import { drizzle } from '#server/middlewares/drizzle.ts';
import { jwt } from '#server/middlewares/jwt.ts';

export const route = factory
  .createApp()
  .post(
    '/',
    auth({ requireActiveOrganization: true }),
    zValidator('json', appInstallationSchema.create),
    drizzle(),
    async (c) => {
      const createObj = c.req.valid('json');
      const { tx } = c.var;

      const checkAppInstallation =
        await tx.query.appInstallationTable.findFirst({
          where: and(
            eq(appInstallationTable.app_id, createObj.app_id),
            eq(appInstallationTable.environment_id, createObj.environment_id),
            eq(appInstallationTable.organization_id, createObj.organization_id),
          ),
        });

      if (checkAppInstallation) {
        return c.json({ error: 'App installation already exists' }, 400);
      }

      const [appInstallation] = await tx
        .insert(appInstallationTable)
        .values(createObj)
        .returning();

      if (!appInstallation) {
        return c.json({ error: 'Failed to create app installation' }, 500);
      }

      const [existing] = await tx
        .select()
        .from(appInstallationTable)
        .where(
          and(
            eq(appInstallationTable.app_id, appInstallation.app_id),
            eq(
              appInstallationTable.environment_id,
              appInstallation.environment_id,
            ),
            eq(
              appInstallationTable.organization_id,
              appInstallation.organization_id,
            ),
          ),
        )
        .innerJoin(appTable, eq(appInstallationTable.app_id, appTable.id))
        .innerJoin(
          organizationTable,
          eq(appInstallationTable.organization_id, organizationTable.id),
        )
        .innerJoin(
          environmentTable,
          eq(appInstallationTable.environment_id, environmentTable.id),
        );

      if (!existing) {
        return c.json({ error: 'App installation not found' }, 404);
      }

      const { organization, environment, app } = existing;
      await updateAppInstallation({
        orgId: organization.id,
        orgSlug: organization.slug,
        envId: environment.id,
        envSlug: environment.slug,
        appSlug: app.slug,
        buildId: createObj.app_build_id,
      });

      return c.json(appInstallation);
    },
  )
  .put(
    '/',
    auth({ requireActiveOrganization: true }),
    zValidator(
      'json',
      z.object({
        app_build_id: z.string(),
        environment_id: z.string(),
        organization_id: z.string(),
        app_id: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const updateObj = c.req.valid('json');
      const { tx } = c.var;

      const appInstallation = await tx
        .update(appInstallationTable)
        .set(updateObj)
        .where(
          and(
            eq(appInstallationTable.app_id, updateObj.app_id),
            eq(appInstallationTable.environment_id, updateObj.environment_id),
            eq(appInstallationTable.organization_id, updateObj.organization_id),
          ),
        )
        .returning();

      const [existing] = await tx
        .select()
        .from(appInstallationTable)
        .where(
          and(
            eq(appInstallationTable.app_id, updateObj.app_id),
            eq(appInstallationTable.environment_id, updateObj.environment_id),
            eq(appInstallationTable.organization_id, updateObj.organization_id),
          ),
        )
        .innerJoin(appTable, eq(appInstallationTable.app_id, appTable.id))
        .innerJoin(
          organizationTable,
          eq(appInstallationTable.organization_id, organizationTable.id),
        )
        .innerJoin(
          environmentTable,
          eq(appInstallationTable.environment_id, environmentTable.id),
        );

      if (!existing) {
        return c.json({ error: 'App installation not found' }, 404);
      }

      const { organization, environment, app } = existing;
      await updateAppInstallation({
        orgId: organization.id,
        orgSlug: organization.slug,
        envId: environment.id,
        envSlug: environment.slug,
        appSlug: app.slug,
        buildId: updateObj.app_build_id,
      });

      return c.json(appInstallation);
    },
  )
  .get(
    '/public',
    zValidator(
      'query',
      z.object({
        organizationSlug: z.string(),
        appSlug: z.string(),
      }),
    ),
    async (c) => {
      const { organizationSlug, appSlug } = c.req.valid('query');

      //TODO: Optimise query to not over expose data
      const [appInstallation] = await db
        .select()
        .from(appInstallationTable)
        .innerJoin(appTable, eq(appInstallationTable.app_id, appTable.id))
        .where(
          and(
            eq(organizationTable.slug, organizationSlug),
            eq(appTable.slug, appSlug),
            eq(environmentTable.is_production, true),
            eq(appTable.is_public, true),
          ),
        )
        .innerJoin(
          organizationTable,
          eq(appInstallationTable.organization_id, organizationTable.id),
        )
        .innerJoin(
          environmentTable,
          eq(appInstallationTable.environment_id, environmentTable.id),
        )
        .limit(1);

      if (!appInstallation) return c.json(null);
      const { organization: _, ...rest } = appInstallation;
      return c.json(rest);
    },
  )
  .get(
    '/runner',
    zValidator(
      'query',
      z.object({
        organizationSlug: z.string(),
        environmentSlug: z.string(),
      }),
    ),
    jwt(),
    async (c) => {
      const { organizationSlug, environmentSlug } = c.req.valid('query');
      const jwtPayload = c.get('jwtPayload');
      if (
        jwtPayload.role !== 'runner' ||
        jwtPayload.orgSlug !== organizationSlug ||
        jwtPayload.envSlug !== environmentSlug
      ) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      //TODO: Optimise query to not over expose data
      const appInstallations = await db
        .select()
        .from(appInstallationTable)
        .innerJoin(appTable, eq(appInstallationTable.app_id, appTable.id))
        .innerJoin(
          environmentTable,
          eq(appInstallationTable.environment_id, environmentTable.id),
        )
        .innerJoin(
          organizationTable,
          eq(appInstallationTable.organization_id, organizationTable.id),
        )
        .where(
          and(
            eq(organizationTable.slug, organizationSlug),
            eq(environmentTable.slug, environmentSlug),
          ),
        );

      return c.json(appInstallations);
    },
  )
  .get(
    '/',
    auth({ requireActiveOrganization: true }),
    zValidator(
      'query',
      z.object({
        environment_id: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const query = c.req.valid('query');
      const { activeOrganizationId } = c.get('session');
      const { tx } = c.var;

      const appInstallation = await tx
        .select()
        .from(appInstallationTable)
        .where(
          and(
            eq(appInstallationTable.environment_id, query.environment_id),
            eq(appInstallationTable.organization_id, activeOrganizationId),
          ),
        )
        .innerJoin(appTable, eq(appInstallationTable.app_id, appTable.id));

      return c.json(appInstallation);
    },
  )
  .delete(
    '/',
    auth({ requireActiveOrganization: true }),
    zValidator(
      'query',
      z.object({
        app_id: z.string(),
        environment_id: z.string(),
        org_id: z.string(),
      }),
    ),
    drizzle(),
    async (c) => {
      const { app_id, environment_id, org_id } = c.req.valid('query');
      const { tx } = c.var;

      const appInstallation = await tx
        .delete(appInstallationTable)
        .where(
          and(
            eq(appInstallationTable.app_id, app_id),
            eq(appInstallationTable.environment_id, environment_id),
            eq(appInstallationTable.organization_id, org_id),
          ),
        )
        .returning();

      return c.json(appInstallation);
    },
  );

async function updateAppInstallation({
  orgId,
  orgSlug,
  envId,
  envSlug,
  appSlug,
  buildId,
}: {
  orgId: string;
  orgSlug: string;
  envId: string;
  envSlug: string;
  appSlug: string;
  buildId: string;
}) {
  let runnerBaseUrl = `http://${orgSlug}-${envSlug}.${BASE_DOMAIN}`;
  if (process.env.NODE_ENV === 'production') {
    runnerBaseUrl = `http://runner.org-${orgId}-${envId}.svc.cluster.local`;
  }
  const runnerKey = await signJwt({
    role: 'runner',
    orgId,
    orgSlug,
    envId,
    envSlug,
  });
  const res = await fetch(`${runnerBaseUrl}/apps/update/${appSlug}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${runnerKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ buildId }),
  });
  if (!res.ok) {
    console.error('Failed to update app installation', res.statusText);
    throw new Error('Failed to update app installation');
  }
  const data = await res.json();
  return data;
}
