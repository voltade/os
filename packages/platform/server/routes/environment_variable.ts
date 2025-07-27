import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { bearerAuth } from 'hono/bearer-auth';
import { z } from 'zod';

import { environmentVariableTable } from '#drizzle/environment_variable';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { Vault } from '#server/lib/vault.ts';

export const route = factory.createApp().get(
  '/:org_id/:environment_id',
  bearerAuth({ token: appEnvVariables.RUNNER_SECRET_TOKEN }),
  zValidator(
    'param',
    z.object({
      org_id: z.string(),
      environment_id: z.string(),
    }),
  ),
  async (c) => {
    const { org_id, environment_id } = c.req.valid('param');

    const env_vars_ids = await db
      .select({
        id: environmentVariableTable.id,
        name: environmentVariableTable.name,
      })
      .from(environmentVariableTable)
      .where(
        and(
          eq(environmentVariableTable.org_id, org_id),
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
);
