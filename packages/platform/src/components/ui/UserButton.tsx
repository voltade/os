import {
  ActionIcon,
  Avatar,
  Box,
  Divider,
  Group,
  Menu,
  Skeleton,
  Text,
} from '@mantine/core';
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { redirect, useNavigate } from '@tanstack/react-router';

import { authClient } from '#src/lib/auth.ts';

export function UserButton() {
  const navigate = useNavigate();
  const { data: sessionData, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton height={32} width={32} radius="xl" />;
  }

  if (!sessionData) {
    redirect({ to: '/signin' });
    return null;
  }

  const handleLogout = async () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          localStorage.removeItem('voltade-jwt');
          console.log('User signed out');
          navigate({ to: '/signin' }); // Use navigate hook for proper routing
        },
      },
    });
  };

  const handleProfile = () => {
    // Add profile navigation logic here
    console.log('Profile clicked');
  };

  const handleSettings = () => {
    // Add settings navigation logic here
    console.log('Settings clicked');
  };

  return (
    <Menu shadow="md" width={250} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="transparent" size="lg" radius="xl">
          <Avatar size="sm" src={sessionData.user.image} radius="xl">
            {!sessionData.user.image && (
              <IconUserCircle
                size={20}
                color="var(--mantine-primary-color-filled)"
              />
            )}
          </Avatar>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Box p="sm">
          <Group gap="sm">
            <Avatar size="md" src={sessionData.user.image} radius="xl">
              {!sessionData.user.image && <IconUserCircle size={24} />}
            </Avatar>
            <Box>
              <Text size="sm" fw={500}>
                {sessionData.user.name || 'User'}
              </Text>
              <Text size="xs" c="dimmed">
                {sessionData.user.email}
              </Text>
            </Box>
          </Group>
        </Box>

        <Divider />

        <Menu.Label>Account</Menu.Label>

        <Menu.Item leftSection={<IconUser size={14} />} onClick={handleProfile}>
          <Text size="sm">Profile</Text>
        </Menu.Item>

        <Menu.Item
          leftSection={<IconSettings size={14} />}
          onClick={handleSettings}
        >
          <Text size="sm">Settings</Text>
        </Menu.Item>

        <Divider my="0.25rem" />

        <Menu.Item
          leftSection={<IconLogout size={14} />}
          onClick={handleLogout}
          color="red"
        >
          <Text size="sm">Logout</Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
