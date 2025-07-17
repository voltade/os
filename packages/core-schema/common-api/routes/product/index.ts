import type { Db } from '../../../utils/db.ts';
import { createGetProductsRoute } from './get-products.ts';

export const createProductRoute = (db: Db) => {
  const getProductsRoute = createGetProductsRoute(db);

  return getProductsRoute;
};
