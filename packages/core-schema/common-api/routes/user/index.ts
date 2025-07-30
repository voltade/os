import { Hono } from 'hono';

import type { Db } from '../../../lib/db.ts';

export const createUserRoute = (_db: Db) => {
  return new Hono().get('/', async (c) => {
    // Example user route
    return c.json({ message: 'Users endpoint' });
  });
};

export type UserRouteType = ReturnType<typeof createUserRoute>;
