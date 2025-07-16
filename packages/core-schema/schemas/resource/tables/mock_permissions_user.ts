import { foreignKey, integer, primaryKey } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { mockPermissionsTable } from './mock_permissions.ts';
import { userTable } from './user.ts';

export const mockPermissionsUserTable = internalSchema.table(
  'resource_mock_permissions_user',
  {
    user_id: integer().notNull(),
    permission_id: integer().notNull(),
  },
  (table) => [
    primaryKey({
      name: 'pk_resourcemock_permissions_user',
      columns: [table.user_id, table.permission_id],
    }),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [userTable.id],
      name: 'fk_resourcemock_permissions_user_user',
    }),
    foreignKey({
      columns: [table.permission_id],
      foreignColumns: [mockPermissionsTable.id],
      name: 'fk_resourcemock_permissions_user_permission',
    }),
  ],
);
