import { zValidator } from '@hono/zod-validator';
import {
  calculateOffset,
  createPaginationMeta,
  paginationValidator,
  totalCount,
} from '@voltade/core-schema/common-api';
import { productTable } from '@voltade/core-schema/schemas';
import { getTableColumns } from 'drizzle-orm';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory
  .createApp()
  .get('/', zValidator('query', paginationValidator), async (c) => {
    const { page, limit } = c.req.valid('query');

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
