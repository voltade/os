import { createFileRoute, Outlet } from '@tanstack/react-router';

import { DevSidebar } from '#src/components/ui/dev/Sidebar';
import { AccessDenied } from '#src/components/utils/access-denied';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

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

  return (
    <div className="flex min-h-[calc(100dvh-theme(spacing.24))] gap-6">
      <DevSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
