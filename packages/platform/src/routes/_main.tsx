import { AppShell } from '@mantine/core';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main')({
  beforeLoad: async () => {
    const { data, error } = await authClient.getSession();
    if (!data || error) {
      return redirect({ to: '/signin' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShell padding="md">
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
