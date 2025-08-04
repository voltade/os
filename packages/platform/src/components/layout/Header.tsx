import { AppShell, Group, Title } from '@mantine/core';
import { IconCode } from '@tabler/icons-react';

import { OrganizationSwitcher } from './OrganizationSwitcher.tsx';
import { UserButton } from './UserButton.tsx';

export function Header() {
  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <IconCode />
          <Title order={4}>Voltade-OS</Title>
        </Group>
        <Group gap="md">
          <OrganizationSwitcher />
          <UserButton />
        </Group>
      </Group>
    </AppShell.Header>
  );
}
