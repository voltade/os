import { text } from 'drizzle-orm/pg-core';

import { internalSchema } from '../../../schema.ts';
import { id } from '../../utils.ts';

export const mockPermissionsTable = internalSchema.table(
  'resource_mock_permissions',
  {
    id,
    name: text().notNull().unique(),
  },
);
