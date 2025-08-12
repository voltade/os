import {
  createFileRoute,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';

import { DevSidebar } from '#src/components/ui/dev/Sidebar';
import { EnvironmentSettingsSidebar } from '#src/components/ui/environment/SettingsSidebar';
import { AccessDenied } from '#src/components/utils/access-denied';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (isPending) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;
  const isAllowed =
    currentUserRole === 'owner' || currentUserRole === 'developer';

  if (!isAllowed) {
    return <AccessDenied />;
  }

  const envMatch = pathname.match(/^\/dev\/environments\/([^/]+)(?:\/|$)/);
  const environmentSlug = envMatch?.[1] ?? null;

  return (
    <div className="flex min-h-[calc(100dvh-theme(spacing.24))] gap-6">
      {environmentSlug ? (
        <EnvironmentSettingsSidebar
          envSlug={environmentSlug}
          basePathPrefix="/dev/environments"
        />
      ) : (
        <DevSidebar />
      )}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
