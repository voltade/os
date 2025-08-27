import { classView } from '@voltade/core-schema/schemas';

import { factory } from '#server/factory.ts';
import { auth } from '#server/middlewares/auth.ts';
import { drizzle } from '#server/middlewares/drizzle.ts';

export const route = factory
  .createApp()
  .use(auth)
  .use(drizzle())
  .get('/', async (c) => {
    const classes = await c.var.tx.select().from(classView);
    return c.json({ data: classes });
  });
