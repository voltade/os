import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { environmentVariableTable } from '#drizzle/environment_variable.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { Vault } from '#server/lib/vault.ts';
import { auth } from '#server/middlewares/auth.ts';
import { jwt } from '#server/middlewares/jwt.ts';
import {
  checkReservedEnvironmentVariableNames,
  reservedNames,
} from '#server/utils/environment_variable.ts';

export const route = factory
  .createApp()
  .get(
    '/:organization_id/:environment_id',
    zValidator(
      'param',
      z.object({
        organization_id: z.string(),
        environment_id: z.string(),
      }),
    ),
    jwt(),
    async (c) => {
      const { organization_id, environment_id } = c.req.valid('param');
      const jwtPayload = c.get('jwtPayload');
      if (
        jwtPayload.role !== 'runner' ||
        jwtPayload.orgId !== organization_id ||
        jwtPayload.envId !== environment_id
      ) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const EnvVarIds = await db
        .select({
          id: environmentVariableTable.id,
          name: environmentVariableTable.name,
          secret_id: environmentVariableTable.secret_id,
        })
        .from(environmentVariableTable)
        .where(
          and(
            eq(environmentVariableTable.organization_id, organization_id),
            eq(environmentVariableTable.environment_id, environment_id),
          ),
        );

      const decryptedEnvVars = await Vault.getMany(
        EnvVarIds.filter((e) => e.secret_id)
          // biome-ignore lint/style/noNonNullAssertion: secret_id is guaranteed to be set by filter
          .map((e) => e.secret_id!),
      );

      const envVars = EnvVarIds.reduce(
        (acc, e) => {
          // biome-ignore lint/style/noNonNullAssertion: secret_id is guaranteed to be set by filter
          acc[e.name] = decryptedEnvVars[e.secret_id!]!;
          return acc;
        },
        {} as Record<string, string>,
      );

      return c.json(envVars);
    },
  )
  .use(auth({ requireActiveOrganization: true }))
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        environment_id: z.string(),
      }),
    ),
    async (c) => {
      const { activeOrganizationId } = c.get('session');
      const { environment_id } = c.req.valid('query');

      const environmentVariable = await db
        .select()
        .from(environmentVariableTable)
        .where(
          and(
            eq(environmentVariableTable.environment_id, environment_id),
            eq(environmentVariableTable.organization_id, activeOrganizationId),
          ),
        );

      return c.json(environmentVariable);
    },
  )
  .post(
    '/',
    zValidator(
      'json',
      z.object({
        environment_id: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
        value: z.string(),
      }),
    ),
    auth(),
    async (c) => {
      const { activeOrganizationId } = c.get('session');
      const { environment_id, name, description, value } = c.req.valid('json');

      if (checkReservedEnvironmentVariableNames(name)) {
        return c.json(
          {
            error: 'Reserved environment variable name',
            reservedNames,
          },
          400,
        );
      }
      // Create secret in vault first
      const secretId = await Vault.create(value);

      const environmentVariable = await db
        .insert(environmentVariableTable)
        .values({
          organization_id: activeOrganizationId,
          environment_id,
          name,
          description,
          secret_id: secretId,
        })
        .returning();

      return c.json(environmentVariable[0]);
    },
  )
  .put(
    '/',
    zValidator(
      'json',
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable().optional(),
        value: z.string(),
      }),
    ),
    auth(),
    async (c) => {
      const { activeOrganizationId } = c.get('session');
      const { id, name, description, value } = c.req.valid('json');

      // First verify the environment variable exists and belongs to the org
      const existingVariable = await db
        .select()
        .from(environmentVariableTable)
        .where(
          and(
            eq(environmentVariableTable.id, id),
            eq(environmentVariableTable.organization_id, activeOrganizationId),
          ),
        )
        .limit(1);

      if (existingVariable.length === 0 || !existingVariable[0]) {
        return c.json({ error: 'Environment variable not found' }, 404);
      }

      // Update the environment variable
      const updatedVariable = await db
        .update(environmentVariableTable)
        .set({
          name,
          description,
          updated_at: new Date(),
        })
        .where(eq(environmentVariableTable.id, id))
        .returning();

      // Update the value in the vault
      if (existingVariable[0].secret_id) {
        await Vault.update(existingVariable[0].secret_id, value);
      }

      return c.json(updatedVariable[0]);
    },
  )
  .delete(
    '/',
    zValidator('query', z.object({ id: z.string() })),
    auth(),
    async (c) => {
      const { activeOrganizationId } = c.get('session');
      const { id } = c.req.valid('query');

      // First get the environment variable to check ownership and get secret_id
      const existingVariable = await db
        .select()
        .from(environmentVariableTable)
        .where(
          and(
            eq(environmentVariableTable.id, id),
            eq(environmentVariableTable.organization_id, activeOrganizationId),
          ),
        )
        .limit(1);

      if (existingVariable.length === 0 || !existingVariable[0]) {
        return c.json({ error: 'Environment variable not found' }, 404);
      }

      // Delete the environment variable
      const environmentVariable = await db
        .delete(environmentVariableTable)
        .where(eq(environmentVariableTable.id, id))
        .returning();

      // Delete from vault if secret exists
      if (existingVariable[0].secret_id) {
        await Vault.delete(existingVariable[0].secret_id);
      }

      return c.json(environmentVariable[0]);
    },
  )
  .get(
    '/secret',
    zValidator(
      'query',
      z.object({
        environment_id: z.string(),
        environment_variable_id: z.string().optional(),
      }),
    ),
    auth(),
    async (c) => {
      const { activeOrganizationId } = c.get('session');
      const { environment_id, environment_variable_id } = c.req.valid('query');

      const environmentVariable = await db
        .select()
        .from(environmentVariableTable)
        .where(
          and(
            eq(environmentVariableTable.environment_id, environment_id),
            eq(environmentVariableTable.organization_id, activeOrganizationId),
            environment_variable_id
              ? eq(environmentVariableTable.id, environment_variable_id)
              : undefined,
          ),
        );

      const decryptedEnvVars = await Vault.getMany(
        environmentVariable
          .filter((e) => e.secret_id)
          // biome-ignore lint/style/noNonNullAssertion: secret_id is guaranteed to be set by filter
          .map((e) => e.secret_id!),
      );

      const envVars = environmentVariable.reduce(
        (acc, e) => {
          acc.push({
            ...e,
            // biome-ignore lint/style/noNonNullAssertion: secret_id is guaranteed to be set by filter
            value: decryptedEnvVars[e.secret_id!]!,
          });
          return acc;
        },
        [] as (typeof environmentVariableTable.$inferSelect & {
          value: string;
        })[],
      );

      return c.json(envVars);
    },
  );
