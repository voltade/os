import { zValidator } from '@hono/zod-validator';
import { getTableColumns } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { Hono } from 'hono';

import type { Db } from '../../utils/db.ts';
import { buildWhereClause } from '../builders/where-clause.ts';
import {
  calculateOffset,
  createPaginationMeta,
  paginationValidator,
  totalCount,
} from '../utils/pagination.ts';

/**
 * Creates a paginated list route for any Drizzle table.
 * Perfect for populating data tables with filtering and pagination.
 */
export function createListRoute<T extends PgTable>(
  table: T,
  db: Db,
  options: {
    /** Fields to omit from query validation */
    omit?: Record<string, true>;
  } = {},
) {
  // Create validator directly with hardcoded pagination
  const tableSchema = createSelectSchema(table)
    .partial()
    .omit(
      options.omit || {
        created_at: true,
        updated_at: true,
      },
    );

  // Create the validator without complex type assertion
  const validator = tableSchema.extend(paginationValidator.shape);

  return new Hono().get('/', zValidator('query', validator), async (c) => {
    const rawQuery = c.req.query();

    // Parse pagination with proper types
    const paginationResult = paginationValidator.parse(rawQuery);
    const { page, limit } = paginationResult;

    // Parse table filters
    const tableResult = tableSchema.parse(rawQuery);
    const filters = tableResult;

    const whereClause = buildWhereClause(table, validator, filters);

    const columns = getTableColumns(table);
    const result = await db
      .select({
        ...columns,
        totalCount,
      })
      .from(table as PgTable)
      .where(whereClause)
      .limit(limit)
      .offset(calculateOffset(page, limit));

    const data = result.map(({ totalCount, ...item }) => item);

    return c.json({
      data,
      pagination: createPaginationMeta(page, limit, result),
    });
  });
}
