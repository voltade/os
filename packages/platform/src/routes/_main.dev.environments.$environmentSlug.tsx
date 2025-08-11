import { createFileRoute, Outlet } from '@tanstack/react-router';

import { EnvironmentNavbar } from '#src/components/ui/environment/Navbar';
import { AccessDenied } from '#src/components/utils/access-denied';
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

  if (isPending) return null;

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  if (!isAllowed) return <AccessDenied />;

  return (
    <>
      <EnvironmentNavbar
        envSlug={environmentSlug}
        basePathPrefix="/dev/environments"
      />
      <Outlet />
    </>
  );
}
