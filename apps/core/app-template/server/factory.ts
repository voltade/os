import { createFactory } from 'hono/factory';

import { appEnvVariables } from './env.ts';
import type { AppEnvVariables } from './zod/env.ts';

export type Oauth2Payload = {
  role: string;
  sub: string;
  aud: string[];
  iss: string;
  iat: number;
  exp: number;
};

export const factory = createFactory<{
  Bindings: AppEnvVariables;
  Variables: {
    oauth2: Oauth2Payload | null | undefined;
  };
}>({
  initApp(app) {
    app.use(async (c, next) => {
      c.env = appEnvVariables;
      await next();
    });
  },
});
