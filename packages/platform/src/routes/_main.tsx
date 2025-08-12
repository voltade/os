import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { SidebarProvider } from '@voltade/ui/sidebar.js';

import { Header } from '#src/components/ui/Header';
import { useEnsureActiveOrganization } from '#src/hooks/useEnsureActiveOrganization';
import { authClient } from '#src/lib/auth.ts';
import { isJWTExpired } from '#src/lib/isJWTExpired';

export const Route = createFileRoute('/_main')({
  beforeLoad: async () => {
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
    if (!data.user?.name || data.user.name.trim().length === 0) {
      return redirect({ to: '/onboarding' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  useRouterState({ select: (s) => s.location });
  useEnsureActiveOrganization();

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 min-w-0">
          <div className="container min-w-screen">
            <div className="px-15 py-4">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
