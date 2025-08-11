import { Stack, Text, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { AccessDenied } from '#src/components/utils/access-denied';
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
    <Stack>
      <Title order={2}>Git Providers</Title>
      <Text c="dimmed">Management UI coming soon.</Text>
    </Stack>
  );
}
