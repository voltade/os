import { zValidator } from '@hono/zod-validator';
import { userTable } from '@voltade-os/core-schema/schemas/resource/tables/user';
import { getTableColumns } from 'drizzle-orm';
import { Hono } from 'hono';

import type { Db } from '../../../utils/db.ts';
import {
  calculateOffset,
  createPaginationMeta,
  paginationValidator,
  totalCount,
} from '../../utils/pagination.ts';

export const createGetUsersRoute = (db: Db) => {
  const route = new Hono();

  route.get('/', zValidator('query', paginationValidator), async (c) => {
    const { page, limit } = c.req.valid('query');

    const result = await db
      .select({
        ...getTableColumns(userTable),
        totalCount,
      })
      .from(userTable)
      .limit(limit)
      .offset(calculateOffset(page, limit));

    const data = result.map(({ totalCount, ...user }) => user);

    return c.json({
      data,
      pagination: createPaginationMeta(page, limit, result),
    });
  });

  return route;
};
