import { AppShell } from '@mantine/core';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Header } from '#src/components/layout/Header.tsx';
import { authClient } from '#src/lib/auth.ts';
import { isJWTExpired } from '#src/lib/isJWTExpired';

export const Route = createFileRoute('/_main')({
  beforeLoad: async () => {
    // Check if existing JWT is expired
    const existingJwt = localStorage.getItem('voltade-jwt');
    if (existingJwt && isJWTExpired(existingJwt)) {
      localStorage.removeItem('voltade-jwt');
    }

    const { data, error } = await authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          const jwt = ctx.response.headers.get('set-auth-jwt');
          if (jwt) {
            localStorage.setItem('voltade-jwt', jwt);
            console.log('JWT stored:', jwt);
          }
        },
      },
    });
    if (!data || error) {
      localStorage.removeItem('voltade-jwt');
      return redirect({ to: '/signin' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppShell padding="md" header={{ height: 48 }}>
      <Header />
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
