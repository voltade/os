import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconDatabase,
  IconPlus,
  IconSearch,
  IconServer,
} from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { AccessDenied } from '#src/components/utils/access-denied';
import { useEnvironments } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/environments/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: environments, isLoading } = useEnvironments();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  const filteredEnvironments = useMemo(() => {
    if (!environments) return [];
    if (!searchQuery.trim()) return environments;

    return environments.filter(
      (env) =>
        env.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        env.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        env.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [environments, searchQuery]);

  if (!isAllowed) return <AccessDenied />;

  if (isLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="lg" />
        <Text c="dimmed">Loading environments...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Environments</Title>
        <Button leftSection={<IconPlus size={16} />} variant="filled">
          Add New Environment
        </Button>
      </Group>

      <TextInput
        placeholder="Search environments..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
        size="md"
        style={{ maxWidth: 400 }}
      />

      {filteredEnvironments.length === 0 ? (
        <Card padding="xl" style={{ textAlign: 'center' }}>
          <Stack align="center" gap="md">
            <IconServer size={48} stroke={1} style={{ opacity: 0.5 }} />
            <Text size="lg" fw={500}>
              {searchQuery ? 'No environments found' : 'No environments yet'}
            </Text>
            <Text c="dimmed">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create your first environment to get started'}
            </Text>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
          {filteredEnvironments.map((environment) => (
            <Card key={environment.id} padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Text fw={600} size="lg" lineClamp={1}>
                        {environment.name || environment.slug}
                      </Text>
                      {environment.is_production && (
                        <Badge color="red" size="sm" variant="light">
                          Production
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed">
                      {environment.slug}
                    </Text>
                    {environment.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {environment.description}
                      </Text>
                    )}
                  </Stack>
                </Group>

                <Group gap="lg">
                  <Group gap="xs">
                    <IconServer size={14} style={{ opacity: 0.7 }} />
                    <Text size="sm" c="dimmed">
                      {environment.runner_count} runner
                      {environment.runner_count !== 1 ? 's' : ''}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconDatabase size={14} style={{ opacity: 0.7 }} />
                    <Text size="sm" c="dimmed">
                      {environment.database_instance_count} DB
                      {environment.database_instance_count !== 1 ? 's' : ''}
                    </Text>
                  </Group>
                </Group>

                <Group gap="xs" mt="xs">
                  <Text size="xs" c="dimmed">
                    Created{' '}
                    {new Date(environment.created_at).toLocaleDateString()}
                  </Text>
                  {environment.updated_at !== environment.created_at && (
                    <>
                      <Text size="xs" c="dimmed">
                        •
                      </Text>
                      <Text size="xs" c="dimmed">
                        Updated{' '}
                        {new Date(environment.updated_at).toLocaleDateString()}
                      </Text>
                    </>
                  )}
                </Group>

                <Button
                  variant="light"
                  fullWidth
                  onClick={() =>
                    navigate({
                      to: '/dev/environments/$environmentSlug',
                      params: { environmentSlug: environment.slug },
                    })
                  }
                >
                  Manage Environment
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
