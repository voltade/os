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

  const validator = tableSchema.extend(paginationValidator.shape);

  return new Hono().get('/', async (c) => {
    const rawQuery = c.req.query();

    // Parse pagination separately to ensure proper types
    const paginationResult = paginationValidator.safeParse(rawQuery);
    if (!paginationResult.success) {
      return c.json(
        {
          error: 'Invalid pagination parameters',
          details: paginationResult.error,
        },
        400,
      );
    }

    const { page, limit } = paginationResult.data;

    // Parse table filters
    const tableResult = tableSchema.safeParse(rawQuery);
    if (!tableResult.success) {
      return c.json(
        { error: 'Invalid filter parameters', details: tableResult.error },
        400,
      );
    }

    const filters = tableResult.data;

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
