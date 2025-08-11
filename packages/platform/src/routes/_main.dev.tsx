import { Center, Loader, Stack, Text, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

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

  return (
    <Stack gap="md">
      <div>
        <Title order={2}>Developer Tools</Title>
        <Text c="dimmed">
          Internal tools and debug utilities for developers.
        </Text>
      </div>

      {/* Content placeholder */}
      <Stack>
        <Text>Coming soon...</Text>
      </Stack>
    </Stack>
  );
}
