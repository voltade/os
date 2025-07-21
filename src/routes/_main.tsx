import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { ory } from '#src/lib/ory.ts';

export const Route = createFileRoute('/_main')({
  beforeLoad: async ({ location }) => {
    try {
      await ory.toSession();
    } catch (error) {
      console.error(error);
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
