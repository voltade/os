import { zValidator } from '@hono/zod-validator';
import { getTableColumns } from 'drizzle-orm';
import { Hono } from 'hono';

import { productTable } from '../../../schemas/product/index.ts';
import type { Db } from '../../../utils/db.ts';
import {
  calculateOffset,
  createPaginationMeta,
  paginationValidator,
  totalCount,
} from '../../utils/pagination.ts';

export const createGetProductsRoute = (db: Db) => {
  return new Hono().get(
    '/',
    zValidator('query', paginationValidator),
    async (c) => {
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
    },
  );
};
