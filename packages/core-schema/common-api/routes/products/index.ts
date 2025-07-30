import type { Db } from '../../../lib/db.ts';
import { createGetProductsRoute } from './get-products.ts';

export const createProductRoute = (db: Db) => {
  return createGetProductsRoute(db);
};
