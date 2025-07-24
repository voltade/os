import { zValidator } from '@hono/zod-validator';
import { and, eq } from 'drizzle-orm';
import { bearerAuth } from 'hono/bearer-auth';
import { z } from 'zod';

import { envVars } from '#server/drizzle/envVars.ts';
import { appEnvVariables } from '#server/env.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import { Vault } from '#server/lib/vault.ts';

export const route = factory.createApp().get(
  '/:orgId/:environmentId',
  bearerAuth({ token: appEnvVariables.RUNNER_SECRET_TOKEN }),
  zValidator(
    'param',
    z.object({
      orgId: z.string(),
      environmentId: z.string(),
    }),
  ),
  async (c) => {
    const { orgId, environmentId } = c.req.valid('param');

    const env_vars_ids = await db
      .select({ id: envVars.id, name: envVars.name })
      .from(envVars)
      .where(
        and(eq(envVars.orgId, orgId), eq(envVars.environmentId, environmentId)),
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
