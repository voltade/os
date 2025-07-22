import { getTableColumns } from 'drizzle-orm';
import { Hono } from 'hono';

import { productTable } from '../../../schemas/product/index.ts';
import type { Db } from '../../../utils/db.ts';
import { buildWhereClause } from '../../builders/where-clause.ts';
import {
  calculateOffset,
  createPaginationMeta,
  totalCount,
} from '../../utils/pagination.ts';
import { createQueryHandler } from '../../validators/query-params.ts';

const queryHandler = createQueryHandler(productTable, {
  omit: {
    created_at: true,
    updated_at: true,
  },
});

export const createGetProductsRoute = (db: Db) => {
  return new Hono().get('/', async (c) => {
    const parseResult = queryHandler.safeParse(c.req.query());
    if (!parseResult.success) {
      return c.json(
        { error: 'Invalid query parameters', details: parseResult.error },
        400,
      );
    }

    const { page, limit, ...filters } = parseResult.data;

    const whereClause = buildWhereClause(
      productTable,
      queryHandler.schema,
      filters,
    );

    const result = await db
      .select({
        ...getTableColumns(productTable),
        totalCount,
      })
      .from(productTable)
      .where(whereClause)
      .limit(limit)
      .offset(calculateOffset(page, limit));

    const data = result.map(({ totalCount, ...product }) => product);

    return c.json({
      data,
      pagination: createPaginationMeta(page, limit, result),
    });
  });
};
