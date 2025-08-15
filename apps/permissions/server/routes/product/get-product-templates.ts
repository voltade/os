import { zValidator } from '@hono/zod-validator';
import {
  calculateOffset,
  createPaginationMeta,
  paginationValidator,
  totalCount,
} from '@voltade/core-schema/common-api';
import { productTemplateTable } from '@voltade/core-schema/schemas';
import { getTableColumns } from 'drizzle-orm';

import { factory } from '#server/factory.ts';
import { db } from '#server/lib/db.ts';

export const route = factory
  .createApp()
  .get(
    '/product-templates',
    zValidator('query', paginationValidator),
    async (c) => {
      const { page, limit } = c.req.valid('query');

      const result = await db
        .select({
          ...getTableColumns(productTemplateTable),
          totalCount,
        })
        .from(productTemplateTable)
        .limit(limit)
        .offset(calculateOffset(page, limit));

      const data = result.map(({ totalCount, ...product_template }) => ({
        ...product_template,
      }));

      return c.json({
        data,
        pagination: createPaginationMeta(page, limit, result),
      });
    },
  );
