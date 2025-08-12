import { IconArrowLeft } from '@tabler/icons-react';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

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
    <div className="min-w-0 flex-1">
      <div className="mb-3">
        <Link
          to={'/dev/environments'}
          className="inline-flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <IconArrowLeft size={16} /> Back
        </Link>
      </div>
      <Outlet />
    </div>
  );
}
