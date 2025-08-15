import { createFactory } from 'hono/factory';

import { appEnvVariables } from './env.ts';
import type { AppEnvVariables } from './zod/env.ts';

export const factory = createFactory<{ Bindings: AppEnvVariables }>({
  initApp(app) {
    app.use(async (c, next) => {
      c.env = appEnvVariables;
      await next();
    });
  },
});
