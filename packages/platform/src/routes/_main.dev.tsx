import { Center, Loader } from '@mantine/core';
import { createFileRoute, Outlet } from '@tanstack/react-router';

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
      <Center h={200}>
        <Loader />
      </Center>
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

  return <Outlet />;
}
