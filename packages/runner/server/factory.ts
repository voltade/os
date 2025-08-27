import { createFactory } from 'hono/factory';

import type { AppEnvVariables } from '#server/zod/env.ts';
import { appEnvVariables } from '#server/zod/env.ts';
import type { Variables } from './env.ts';

export const factory = createFactory<{
  Variables: Variables;
  Bindings: AppEnvVariables;
}>({
  initApp(app) {
    app.use(async (c, next) => {
      c.env = appEnvVariables;
      await next();
    });
  },
});
