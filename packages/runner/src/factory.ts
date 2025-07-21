import { createFactory } from 'hono/factory';

import type { Variables } from '#runner/env.ts';
import type { AppEnvVariables } from '#runner/zod/env.ts';

export const factory = createFactory<{
  Variables: Variables;
  Bindings: AppEnvVariables;
}>();
