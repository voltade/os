import { Avatar, Box, Button, Menu, Skeleton, Text } from '@mantine/core';
import { IconCheck, IconChevronDown, IconSettings } from '@tabler/icons-react';

import { authClient } from '#src/lib/auth.ts';

export function OrganizationSwitcher() {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  if (isPending) {
    return <Skeleton height={32} width={120} radius="md" />;
  }

  const handleSwitchOrganization = async (orgId: string) => {
    await authClient.organization.setActive({
      organizationId: orgId,
    });
  };

  const currentOrg = activeOrganization;

  return (
    <Menu shadow="md" position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          justify="flex-end"
          leftSection={
            <Avatar size="sm" radius="md" src={currentOrg?.logo}>
              {!currentOrg?.logo && currentOrg?.name && (
                <Text size="xs" fw={600}>
                  {currentOrg.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </Avatar>
          }
          rightSection={<IconChevronDown size={12} />}
        >
          <Text size="sm" fw={500}>
            {currentOrg?.name || 'Select Organization'}
          </Text>
        </Button>
      </Menu.Target>

      {!organizations?.length ? (
        <Menu.Dropdown miw={200}>
          <Menu.Label>Organization Required</Menu.Label>

          <Box p="sm">
            <Text size="sm" c="dimmed" ta="center">
              You need to be part of an organization to continue.
            </Text>
          </Box>
        </Menu.Dropdown>
      ) : (
        <Menu.Dropdown miw={200}>
          <Menu.Label>Switch Organization</Menu.Label>

          {organizations.map((org) => (
            <Menu.Item
              key={org.id}
              onClick={() => handleSwitchOrganization(org.id)}
              leftSection={
                <Avatar size="sm" radius="md" src={org.logo}>
                  {!org.logo && (
                    <Text size="sm" fw={600}>
                      {org.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </Avatar>
              }
              rightSection={
                currentOrg?.id === org.id ? (
                  <IconCheck
                    size={16}
                    color="var(--mantine-primary-color-filled)"
                  />
                ) : null
              }
            >
              <Box>
                <Text size="sm" fw={currentOrg?.id === org.id ? 600 : 400}>
                  {org.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {org.slug}
                </Text>
              </Box>
            </Menu.Item>
          ))}
          {currentOrg && (
            <>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconSettings size={16} />}
                onClick={() => console.log('Organization settings')}
              >
                <Text size="sm">Settings</Text>
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      )}
    </Menu>
  );
}
