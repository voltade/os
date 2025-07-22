import { productTable } from '../../../schemas/product/index.ts';
import type { Db } from '../../../utils/db.ts';
import { createListRoute } from '../../factories/list-route.ts';

export const createGetProductsRoute = (db: Db) => {
  return createListRoute(productTable, db, {
    omit: {
      created_at: true,
      updated_at: true,
    },
  });
};
