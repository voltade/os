import { createFileRoute } from '@tanstack/react-router';

import { AccessDenied } from '#src/components/utils/access-denied.tsx';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/git-providers')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  if (!isAllowed) return <AccessDenied />;

  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-bold text-foreground">Git Providers</h2>
      <p className="text-sm text-muted-foreground">
        Management UI coming soon.
      </p>
    </div>
  );
}
