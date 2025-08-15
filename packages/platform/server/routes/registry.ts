import { $ } from 'bun';
import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { proxy } from 'hono/proxy';
import z from 'zod';

import { environmentTable } from '#drizzle/environment.ts';
import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory
  .createApp()
  .get(
    '/:packageName',
    zValidator(
      'header',
      z.object({
        authorization: z.string().regex(/^Bearer\s[a-zA-Z0-9-_.]+$/),
      }),
    ),
    async (c) => {
      const environmentId = c.req.valid('header').authorization.split(' ')[1];
      const { packageName } = c.req.param();

      if (packageName !== '@voltade/core-schema') {
        return proxy(`https://registry.npmjs.org/${packageName}}`);
      }

      const [environment] = await db
        .select({
          version: environmentTable.core_schema_version,
        })
        .from(environmentTable)
        .where(eq(environmentTable.id, environmentId));
      if (!environment) {
        return c.json({ error: 'Environment not found' }, 404);
      }

      const json = {
        _id: packageName,
        name: packageName,
        'dist-tags': {
          environment: environment.version,
        },
        versions: {
          [environment.version]: {
            name: packageName,
            version: environment.version,
            dist:
              // encodeURIComponent is used to ensure the URL is safe
              {
                tarball: `http://127.0.0.1.nip.io/api/registry/${encodeURIComponent(packageName)}/-/${environment.version}.tgz`,
              },
          },
        },
      };
      console.log(JSON.stringify(json, null, 2));
      return c.json(json);
    },
  )
  .get('/:packageName/-/:tarball', async (c) => {
    const { packageName, tarball } = c.req.param();
    const [_scope, name] = packageName.split('/');
    const output = (
      await $`bun pm pack --cwd ../${name} --destination $TMPDIR`
    ).text();
    const tarballPath = (await $`echo $TMPDIR/${tarball}`).text();
    return new Response(Bun.file(tarballPath));
  });
