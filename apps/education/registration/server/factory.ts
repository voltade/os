import type { AppEnvVariables } from '@voltade/sdk/server';
import { env } from '@voltade/sdk/server';
import { createFactory } from 'hono/factory';

export const factory = createFactory<{ Bindings: AppEnvVariables }>({
  initApp(app) {
    app.use(async (c, next) => {
      c.env = env;
      await next();
    });
  },
});
