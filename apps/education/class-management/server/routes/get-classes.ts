import { classView } from '@voltade/core-schema/schemas';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory.createApp().get('/', async (c) => {
  const classes = await db.select().from(classView);
  return c.json({ data: classes });
});
