import { createFactory } from 'hono/factory';

import type { Variables } from '#server/env.ts';
import type { AppEnvVariables } from '#server/zod/env.ts';

export const factory = createFactory<{
  Variables: Variables;
  Bindings: AppEnvVariables;
}>();
