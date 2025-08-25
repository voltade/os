import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';

import type { Variables as AppVariables } from '#server/env.ts';
import { auth as betterAuth, type Session } from '#server/lib/auth.ts';

export type Variables = AppVariables & {
  session: Session['session'];
  user: Session['user'];
};

type VariablesWithActiveOrg = Variables & {
  session: Session['session'] & { activeOrganizationId: string };
};

interface Options {
  requireActiveOrganization?: boolean;
}

// @ts-expect-error
export function auth(
  _options: Options & { requireActiveOrganization: true },
): MiddlewareHandler<{
  Variables: VariablesWithActiveOrg;
}>;

export function auth(
  _options?: Options | (Options & { requireActiveOrganization: false }),
): MiddlewareHandler<{ Variables: Variables }>;

export function auth(
  options: Options & { requireActiveOrganization?: boolean } = {},
) {
  return createMiddleware<{ Variables: Variables | VariablesWithActiveOrg }>(
    async (c, next) => {
      const betterAuthSession = await betterAuth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (!betterAuthSession) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const { session, user } = betterAuthSession;
      if (options.requireActiveOrganization) {
        if (!session.activeOrganizationId) {
          return c.json({ error: 'No active organization' }, 403);
        }
      }
      c.set('session', session);
      c.set('user', user);
      return next();
    },
  );
}
