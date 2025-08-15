import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';

import { Header } from '#src/components/ui/Header.tsx';
import { useEnsureActiveOrganization } from '#src/hooks/useEnsureActiveOrganization.ts';
import { usePlatformInitialization } from '#src/hooks/usePlatformInitialization.ts';
import { authClient } from '#src/lib/auth.ts';
import { isJWTExpired } from '#src/lib/isJWTExpired.ts';

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
  usePlatformInitialization();

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col">
        <Header className="h-12" />
        <main className="min-w-0 min-h-[calc(100vh-48px)]">
          <div className="p-4 min-w-screen min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
