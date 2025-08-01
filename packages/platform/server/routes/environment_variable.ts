import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { bearerAuth } from 'hono/bearer-auth';
import { z } from 'zod';

import {
  environmentVariableSchema,
  environmentVariableTable,
} from '#drizzle/environment_variable';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { Vault } from '#server/lib/vault.ts';

export const route = factory
  .createApp()
  .get(
    '/:org_id/:environment_id',
    bearerAuth({ token: appEnvVariables.RUNNER_SECRET_TOKEN }),
    zValidator(
      'param',
      z.object({
        organization_id: z.string(),
        environment_id: z.string(),
      }),
    ),
    async (c) => {
      const { organization_id, environment_id } = c.req.valid('param');

      const env_vars_ids = await db
        .select({
          id: environmentVariableTable.id,
          name: environmentVariableTable.name,
        })
        .from(environmentVariableTable)
        .where(
          and(
            eq(environmentVariableTable.organization_id, organization_id),
            eq(environmentVariableTable.environment_id, environment_id),
          ),
        );

      const decrypted_env_vars = await Vault.getMany(
        env_vars_ids.map((e) => e.id),
      );

      const env_vars = env_vars_ids.reduce(
        (acc, e) => {
          acc[e.name] = decrypted_env_vars[e.id];
          return acc;
        },
        {} as Record<string, string>,
      );

      return c.json(env_vars);
    },
  )
  .get(
    '/',
    zValidator('query', environmentVariableSchema.select.partial()),
    async (c) => {
      const selectObj = c.req.valid('query');

      const environmentVariable = await db
        .select()
        .from(environmentVariableTable)
        .where(
          and(
            ...Object.entries(selectObj).map(([key, value]) =>
              value
                ? eq(
                    environmentVariableTable[
                      key as keyof typeof environmentVariableTable.$inferSelect
                    ],
                    value,
                  )
                : undefined,
            ),
          ),
        );

      return c.json(environmentVariable);
    },
  )
  .post(
    '/',
    zValidator('json', environmentVariableSchema.create),
    async (c) => {
      const createObj = c.req.valid('json');

      const environmentVariable = await db
        .insert(environmentVariableTable)
        .values(createObj)
        .returning();

      return c.json(environmentVariable);
    },
  )
  .delete('/', zValidator('query', z.object({ id: z.string() })), async (c) => {
    const { id } = c.req.valid('query');

    const environmentVariable = await db
      .delete(environmentVariableTable)
      .where(eq(environmentVariableTable.id, id))
      .returning();

    return c.json(environmentVariable);
  });
