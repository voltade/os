import { sql } from 'drizzle-orm';
import z from 'zod';

/**
 * Pagination metadata structure returned by API endpoints
 * @interface PaginationMeta
 */
type PaginationMeta = {
  /** Current page number (1-based) */
  page: number;
  /** Maximum number of items per page */
  limit: number;
  /** Total number of items across all pages */
  total_count: number;
  /** Total number of pages available */
  total_pages: number;
  /** Whether there is a next page available */
  hasNextPage: boolean;
  /** Whether there is a previous page available */
  hasPreviousPage: boolean;
};

/**
 * Zod schema validator for pagination query parameters.
 * Accepts both string and number inputs (useful for URL query params).
 * Automatically transforms string inputs to numbers and applies validation.
 *
 * @example
 * ```typescript
 * // In a route handler
 * const { page, limit } = paginationValidator.parse(req.query);
 *
 * // Valid inputs:
 * paginationValidator.parse({ page: "2", limit: "20" });
 * paginationValidator.parse({ page: 1, limit: 10 });
 * paginationValidator.parse({}); // Uses defaults: page=1, limit=10
 * ```
 */
export const paginationValidator = z.object({
  page: z
    .string()
    .or(z.number())
    .transform((val) => Number(val))
    .pipe(z.number().int().min(1))
    .default(1),

  limit: z
    .string()
    .or(z.number())
    .transform((val) => Number(val))
    .pipe(z.number().int().min(1).max(100))
    .default(10),
});

/**
 * SQL window function to get total count of rows in a paginated query.
 * Use this in your Drizzle select to get both paginated data and total count in a single query.
 *
 * @example
 * ```typescript
 * const result = await db
 *   .select({
 *     ...productTable,
 *     totalCount: totalCount
 *   })
 *   .from(productTable)
 *   .limit(limit)
 *   .offset(offset);
 * ```
 */
export const totalCount = sql<number> /*sql*/`COUNT(*) OVER()`.as(
  'total_count',
);

/**
 * Calculates the database offset for pagination based on page number and limit.
 * Uses 1-based page numbering (page 1 = offset 0).
 *
 * @param page - The current page number (1-based)
 * @param limit - The number of items per page
 * @returns The offset value to use in database queries
 *
 * @example
 * ```typescript
 * const offset = calculateOffset(2, 10); // Returns 10
 * const offset = calculateOffset(1, 20); // Returns 0
 *
 * // Use with Drizzle
 * const data = await db
 *   .select()
 *   .from(table)
 *   .limit(limit)
 *   .offset(calculateOffset(page, limit));
 * ```
 */
export const calculateOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Creates pagination metadata object from query results that include total count.
 * Extracts the total count from the first result row and calculates pagination info.
 *
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @param result - Query result array where each item has a totalCount property
 * @returns Complete pagination metadata object
 *
 * @example
 * ```typescript
 * // After running a query with window function
 * const result = await db
 *   .select({
 *     ...productTable,
 *     totalCount: sql<number>`COUNT(*) OVER()`.as('total_count')
 *   })
 *   .from(productTable)
 *   .limit(limit)
 *   .offset(offset);
 *
 * const paginationMeta = createPaginationMeta(page, limit, result);
 *
 * // Returns:
 * // {
 * //   page: 2,
 * //   limit: 10,
 * //   total_count: 45,
 * //   total_pages: 5,
 * //   hasNextPage: true,
 * //   hasPreviousPage: true
 * // }
 * ```
 */
export const createPaginationMeta = (
  page: number,
  limit: number,
  result: { totalCount: number }[],
): PaginationMeta => {
  const total_count = result.length > 0 ? result[0].totalCount : 0;
  const totalPages = Math.ceil(total_count / limit);

  return {
    page,
    limit,
    total_count,
    total_pages: totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
