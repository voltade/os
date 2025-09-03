import { zValidator } from '@hono/zod-validator';
import { classView } from '@voltade/core-schema/schemas';
import { auth, drizzle } from '@voltade/sdk/server';
import { asc, desc, getViewSelectedFields } from 'drizzle-orm';
import { z } from 'zod';

import { factory } from '#server/factory.ts';

const test = getViewSelectedFields(classView);

type ClassView = keyof typeof test;

const availableColumns = Object.keys(test) as ClassView[];

const querySchema = z.object({
  page: z.string().optional().default('0').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  sortBy: z.enum(availableColumns).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const route = factory
  .createApp()
  .use(auth)
  .use(drizzle())
  .get('/', zValidator('query', querySchema), async (c) => {
    const { page, limit, sortBy, sortOrder } = c.req.valid('query');
    const offset = page * limit;

    // Get total count
    const totalResult = await c.var.tx
      .select({ count: classView.id })
      .from(classView);
    const total = totalResult.length;

    // Build query with optional sorting
    let query = c.var.tx.select().from(classView);
    if (sortBy && sortOrder) {
      query = query.orderBy(
        sortOrder === 'asc' ? asc(classView[sortBy]) : desc(classView[sortBy]),
      ) as typeof query;
    }

    const classes = await query.limit(limit).offset(offset);

    return c.json({
      data: classes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrevious: page > 0,
      },
    });
  });
