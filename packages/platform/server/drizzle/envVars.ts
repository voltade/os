import { and, isNotNull, sql } from 'drizzle-orm';
import { check, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import { DEFAULT_COLUMNS } from './_helpers.ts';
import { environments } from './environments.ts';
import { orgs } from './orgs.ts';
import { vaultSecrets } from './vault/secrets.ts';

export const envVars = pgTable(
  'env_vars',
  {
    ...DEFAULT_COLUMNS,
    name: text('name').notNull(),
    secretId: text('secret_id').references(() => vaultSecrets.id),
    orgId: text('org_id').references(() => orgs.id),
    environmentId: text('environment_id').references(() => environments.id),
    description: text('description'),
  },
  (table) => [
    uniqueIndex('env_vars_name_idx')
      .on(table.name, table.orgId, table.environmentId)
      .where(
        and(
          isNotNull(table.name),
          isNotNull(table.orgId),
          isNotNull(table.environmentId),
        )!,
      ),
    check('valid_env_var_name', sql`${table.name} ~ '^[A-Z_][A-Z0-9_]*$'`),
  ],
);
