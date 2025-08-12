import { createFileRoute, Outlet } from '@tanstack/react-router';

import { EnvironmentSettingsSidebar } from '#src/components/ui/environment/SettingsSidebar';
import { AccessDenied } from '#src/components/utils/access-denied';
import { Loading } from '#src/components/utils/loading';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  if (isPending) return <Loading fullHeight message="Loading environment..." />;

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  if (!isAllowed) return <AccessDenied />;

  return (
    <div className="flex gap-6">
      <EnvironmentSettingsSidebar
        envSlug={environmentSlug}
        basePathPrefix="/dev/environments"
      />
      <div className="min-w-0 flex-1">
        <div className="mb-4 text-sm text-muted-foreground">
          <span>Environments</span>
          <span className="mx-1">/</span>
          <span className="font-medium text-foreground">{environmentSlug}</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
