import type { Db } from '../../../lib/db.ts';
import { userTable } from '../../../schemas/resource/index.ts';
import { createListRoute } from '../../factories/list-route.ts';

export const createGetUsersRoute = (db: Db) => {
  return createListRoute(userTable, db, {
    omit: {
      created_at: true,
      updated_at: true,
    },
  });
};
