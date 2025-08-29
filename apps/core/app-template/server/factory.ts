import { getFactory } from '@voltade/sdk/server';

import { env } from './env.ts';

export const factory = getFactory(env);
