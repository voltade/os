import {
  type ExtractTablesWithRelations,
  type Logger,
  NoopLogger,
  type QueryWithTypings,
} from 'drizzle-orm';
import { type Cache, NoopCache } from 'drizzle-orm/cache/core';
import type { WithCacheConfig } from 'drizzle-orm/cache/core/types';
import {
  PgDatabase,
  PgDialect,
  PgPreparedQuery,
  type PgQueryResultHKT,
  PgSession,
  type PreparedQueryConfig,
  type SelectedFieldsOrdered,
} from 'drizzle-orm/pg-core';
import type { TablesRelationalConfig } from 'drizzle-orm/relations';

class Plv8Database<
  TFullSchema extends Record<string, unknown> = Record<string, never>,
  TSchema extends
    TablesRelationalConfig = ExtractTablesWithRelations<TFullSchema>,
> extends PgDatabase<PgQueryResultHKT, TFullSchema, TSchema> {}

class Plv8Session<
  TFullSchema extends Record<string, unknown>,
  TSchema extends
    TablesRelationalConfig = ExtractTablesWithRelations<TFullSchema>,
> extends PgSession<PgQueryResultHKT, TFullSchema, TSchema> {
  prepareQuery<T extends PreparedQueryConfig>(
    query: QueryWithTypings,
    fields: SelectedFieldsOrdered | undefined,
    // biome-ignore lint/correctness/noUnusedFunctionParameters: include all
    name: string | undefined,
    isResponseInArrayMode: boolean,
    customResultMapper?: (rows: unknown[][]) => T['execute'],
    queryMetadata?: {
      type: 'select' | 'update' | 'delete' | 'insert';
      tables: string[];
    },
    cacheConfig?: WithCacheConfig,
  ): Plv8PreparedQuery<T> {
    return new Plv8PreparedQuery(
      query.sql,
      query.params,
      query.typings,
      new NoopLogger(),
      new NoopCache(),
      queryMetadata,
      cacheConfig,
      fields,
      isResponseInArrayMode,
      customResultMapper,
    );
  }

  override async transaction<T>(): Promise<T> {
    throw new Error('Transactions are not supported by the Plv8 driver');
  }
}

class Plv8PreparedQuery<
  T extends PreparedQueryConfig,
> extends PgPreparedQuery<T> {
  constructor(
    private queryString: string,
    private params: unknown[],
    private typings: unknown[] | undefined,
    private logger: Logger,
    cache: Cache,
    queryMetadata:
      | {
          type: 'select' | 'update' | 'delete' | 'insert';
          tables: string[];
        }
      | undefined,
    cacheConfig: WithCacheConfig | undefined,
    private fields: SelectedFieldsOrdered | undefined,
    private _isResponseInArrayMode: boolean,
    private customResultMapper?: (rows: unknown[][]) => T['execute'],
  ) {
    super({ sql: queryString, params }, cache, queryMetadata, cacheConfig);
  }

  async execute() {
    return plv8.execute(this.queryString, this.params);
  }
}

const pgDialect = new PgDialect();
export const db = new Plv8Database(
  pgDialect,
  new Plv8Session(pgDialect),
  undefined,
);
