import { classView } from '@voltade/core-schema/schemas';
import { auth, drizzle } from '@voltade/sdk/server';

import { factory } from '#server/factory.ts';

export const route = factory
  .createApp()
  .use(auth)
  .use(drizzle())
  .get('/', async (c) => {
    const classes = await c.var.tx.select().from(classView);
    return c.json({ data: classes });
  });
