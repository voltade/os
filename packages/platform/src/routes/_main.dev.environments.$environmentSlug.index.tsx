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
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <h3 className="text-xl font-semibold tracking-tight">{data.name}</h3>
      <p className="text-sm text-muted-foreground">{data.slug}</p>
    </div>
  );
}
