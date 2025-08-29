import { createFactory } from 'hono/factory';

import type { BaseAppEnvVariables } from '../env.ts';
import { baseEnv as sdkEnv } from '../env.ts';
import type { AuthVariables } from '../middlewares/auth.ts';

export const getFactory = <T extends Record<string, string>>(env: T) =>
  createFactory<{
    Bindings: BaseAppEnvVariables & T;
    Variables: AuthVariables;
  }>({
    initApp(app) {
      app.use(async (c, next) => {
        c.env = {
          ...env,
          ...sdkEnv,
        };
        await next();
      });
    },
  });
