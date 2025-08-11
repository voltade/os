import { createFileRoute } from '@tanstack/react-router';

import { EnvironmentVariablesTable } from '#src/components/ui/environment/index.ts';
import { AccessDenied } from '#src/components/utils/access-denied';
import { useEnvironment } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/environment_variables',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const { data: environment } = useEnvironment(environmentSlug);

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  if (!isAllowed) return <AccessDenied />;

  if (!environment) {
    return <div>Environment not found</div>;
  }

  return <EnvironmentVariablesTable environmentId={environment.id} />;
}
