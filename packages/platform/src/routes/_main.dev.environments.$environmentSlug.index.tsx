import { createFileRoute } from '@tanstack/react-router';

import { AccessDenied } from '#src/components/utils/access-denied';
import { useEnvironment } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const { data, isLoading } = useEnvironment(environmentSlug);
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  if (!isAllowed) return <AccessDenied />;

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return <div>No data</div>;
  }
  return <div>{data.name}</div>;
}
