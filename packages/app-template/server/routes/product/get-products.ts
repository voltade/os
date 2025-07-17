import { zValidator } from '@hono/zod-validator';
import { productTable } from '@voltade-os/core-schema/schemas/product';
import { getTableColumns } from 'drizzle-orm';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';
import {
  calculateOffset,
  createPaginationMeta,
  paginationValidator,
  totalCount,
} from '#server/utils/pagination.ts';

export const route = factory.createApp();

route.get(',', zValidator('json', paginationValidator), async (c) => {
  const { page, limit } = c.req.valid('json');

  const result = await db
    .select({
      ...getTableColumns(productTable),
      totalCount,
    })
    .from(productTable)
    .limit(limit)
    .offset(calculateOffset(page, limit));

  const data = result.map(({ totalCount, ...product }) => product);

  return c.json({
    data,
    pagination: createPaginationMeta(page, limit, result),
  });
});
