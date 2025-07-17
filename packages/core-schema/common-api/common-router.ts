import { Hono } from 'hono';

import type { Db } from '../utils/db.ts';
import { createProductRoute } from './routes/product/index.ts';
import { createUserRoute } from './routes/user/index.ts';

export const createCommonRouter = (db: Db) => {
  //TODO: Check if this hono implementation is what we want
  const router = new Hono();
  router.route('/product', createProductRoute(db));
  router.route('/user', createUserRoute(db));

  return router;
};
