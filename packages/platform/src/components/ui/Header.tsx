import { AppShell, Group, Image } from '@mantine/core';

import { AppSelector } from './AppSelector.tsx';
import { OrganizationSwitcher } from './OrganizationSwitcher.tsx';
import { UserButton } from './UserButton.tsx';

export function Header() {
  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Image
            src="https://voltade.com/images/Logo+typo.svg"
            alt="Voltade Logo"
            h={40}
            fit="contain"
          />
        </Group>
        <Group gap="md">
          <AppSelector />
          <OrganizationSwitcher />
          <UserButton />
        </Group>
      </Group>
    </AppShell.Header>
  );
}
