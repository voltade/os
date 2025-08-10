import { AppShell } from '@mantine/core';
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';

import { Header } from '#src/components/ui/Header';
import { OrganizationNavbar } from '#src/components/ui/organization/Navbar';
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
    // If the user has not completed onboarding (no name), redirect to onboarding
    if (!data.user?.name || data.user.name.trim().length === 0) {
      return redirect({ to: '/onboarding' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const location = useRouterState({ select: (s) => s.location });
  return (
    <AppShell
      padding="md"
      header={{ height: 48 }}
      navbar={{ width: 200, breakpoint: 'sm' }}
    >
      <Header />
      {!location.pathname.startsWith('/environments/') && (
        <OrganizationNavbar />
      )}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
