import type { Db } from '../../../utils/db.ts';
import { createGetUsersRoute } from './get-users.ts';

export const createUserRoute = (db: Db) => {
  const getUsersRoute = createGetUsersRoute(db);

  return getUsersRoute;
};
