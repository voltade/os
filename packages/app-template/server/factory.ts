import { createFactory } from 'hono/factory';

import type { AppEnvVariables } from './zod/env.ts';

export const factory = createFactory<{ Bindings: AppEnvVariables }>();
