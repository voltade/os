import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { memo } from 'react';

import { ErrorComponent } from '#src/components/utils/error.tsx';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: memo(Root),
    errorComponent: ({ error, reset }) => (
      <ErrorComponent error={error} reset={reset} />
    ),
  },
);

function Root() {
  return <Outlet />;
}
