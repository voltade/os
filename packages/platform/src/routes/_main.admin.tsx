import { createFileRoute, Outlet } from '@tanstack/react-router';

import { AdminSidebar } from '#src/components/ui/admin/AdminSidebar.tsx';
import { AccessDenied } from '#src/components/utils/access-denied.tsx';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/admin')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  // Get current user's role in the organization
  const currentUserMember = activeOrganization?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;

  // Only admin and owner can access organization settings
  const canViewOrganizationSettings =
    currentUserRole === 'admin' || currentUserRole === 'owner';

  if (!canViewOrganizationSettings) {
    return <AccessDenied />;
  }

  return (
    <div className="flex min-h-[calc(100dvh-theme(spacing.24))] gap-6">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
