import { sql } from 'drizzle-orm';
import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { DatabaseError } from 'pg';

import type { Variables as AppVariables } from '#server/env.ts';
import { db, type Tx } from '#server/lib/db.ts';
import type { AuthVariables } from './auth.ts';

export type Variables = AppVariables & AuthVariables;

export interface TxVariables extends Variables {
  tx: Tx;
}

export interface TxVariables extends Variables {
  tx: Tx;
}

export type WithTx = <T = void>(
  _callback: (_tx: Tx) => Promise<T>,
) => Promise<T>;
export interface WithTxVariables extends Variables {
  withTx: WithTx;
}

interface Options {
  readonly?: boolean;
  /**
   * Set to true if you want to use the `withTx` function instead of the `tx` variable from `c.get()`. Useful when you want to delay the creation of database transaction after some other time consuming tasks.
   * @default false
   */
  lazy?: boolean;
}

export function drizzle(
  _options: Options & { lazy: true },
): MiddlewareHandler<{ Variables: WithTxVariables }>;

export function drizzle(
  _options?: Options | (Options & { lazy: false }),
): MiddlewareHandler<{ Variables: TxVariables }>;

export function drizzle(
  options: Options & { lazy?: boolean } = {},
): MiddlewareHandler {
  return createMiddleware<{ Variables: TxVariables | WithTxVariables }>(
    async (c, next) => {
      const user = c.get('user');
      if (!user) {
        throw new Error(`'c.user' is required (forgot the 'auth' middleware?)`);
      }
      // Read more about Postgres RLS with drizzle:
      // https://github.com/drizzle-team/drizzle-orm/discussions/2450
      try {
        if (options.lazy) {
          const withTx: WithTx = async (callback) => {
            return await db.transaction(async (tx) => {
              await tx.execute(
                sql`select set_config('request.auth.uid', ${user.id}, TRUE)`,
              );
              await tx.execute(sql`set local role authenticated`);
              return await callback(tx);
            });
          };
          c.set('withTx', withTx);
          await next();
        } else {
          await db.transaction(async (tx) => {
            await tx.execute(
              sql`select set_config('request.auth.uid', ${user.id}, TRUE)`,
            );
            await tx.execute(sql`set local role authenticated`);
            c.set('tx', tx);
            await next();
          });
        }
      } catch (error) {
        console.error(error);
        if (error instanceof DatabaseError) {
          console.error(error);
          // https://www.postgresql.org/docs/current/errcodes-appendix.html
          if (error.code === 'P0001' && error.message.startsWith('auth.')) {
            // raise_exception + supabase auth error
            throw new HTTPException(401, {
              res: Response.json({ error: 'unauthorized' }, { status: 401 }),
            });
          }
          if (error.code === '42501') {
            // insufficient_privilege
            throw new HTTPException(403, {
              res: Response.json({ error: 'forbidden' }, { status: 403 }),
            });
          }
          if (error.code === '23505') {
            // unique_violation
            throw new HTTPException(409, {
              res: Response.json({ error: 'conflict' }, { status: 409 }),
            });
          }
        }
        throw error;
      }
    },
  );
}
