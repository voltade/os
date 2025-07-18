import { Hono } from 'hono';

import type { Db } from '../../utils/db.ts';
import { createProductRoute } from './product/index.ts';
import { createUserRoute } from './user/index.ts';

export const createCommonRouter = (db: Db) => {
  const app = new Hono();

  const productRoutes = createProductRoute(db);
  const userRoutes = createUserRoute(db);

  return app.route('/product', productRoutes).route('/user', userRoutes);
};
