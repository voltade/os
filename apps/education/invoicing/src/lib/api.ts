import { createApiClient } from '@voltade/sdk/client';

import type { ApiRoutes } from '#server/index.ts';

export const { api } = createApiClient<ApiRoutes>();
