import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

import { authClient } from '#src/lib/auth';

export function ProfileSecurity() {
  const { data: sessionData } = authClient.useSession();
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const emailForm = useForm({
    mode: 'uncontrolled',
    initialValues: {
      newEmail: '',
    },
    validate: {
      newEmail: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const handleEmailChange = async (values: typeof emailForm.values) => {
    setIsEmailLoading(true);
    try {
      // Change email using BetterAuth (this will trigger email verification)
      const { data, error } = await authClient.changeEmail({
        newEmail: values.newEmail,
      });

      if (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to initiate email change. Please try again.',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Verification Email Sent',
        message: 'Please check your new email address for a verification link.',
        color: 'blue',
      });

      emailForm.reset();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to initiate email change',
        color: 'red',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    setIsLogoutLoading(true);
    try {
      await authClient.signOut();
      notifications.show({
        title: 'Success',
        message: 'Logged out from all sessions',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to logout from all sessions',
        color: 'red',
      });
    } finally {
      setIsLogoutLoading(false);
    }
  };

  if (!sessionData?.user) {
    return <Text>Loading...</Text>;
  }

  return (
    <Container size="sm" py="md">
      <Stack gap="md">
        <Title order={2}>Security</Title>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">
                Current Email
              </Text>
              <Text c="dimmed">{sessionData.user.email}</Text>
              <Text size="xs" c="dimmed" mt={4}>
                {sessionData.user.emailVerified
                  ? '✓ Verified'
                  : '⚠ Not verified'}
              </Text>
            </div>

            <form onSubmit={emailForm.onSubmit(handleEmailChange)}>
              <Stack gap="md">
                <TextInput
                  label="New Email Address"
                  placeholder="Enter new email address"
                  key={emailForm.key('newEmail')}
                  {...emailForm.getInputProps('newEmail')}
                />

                <Group justify="flex-end">
                  <Button
                    type="submit"
                    loading={isEmailLoading}
                    variant="outline"
                  >
                    Change Email
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Paper>

        <Paper p="md" withBorder>
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">
                Sessions
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Manage your active sessions across all devices.
              </Text>
            </div>

            <Group justify="flex-end">
              <Button
                variant="outline"
                color="red"
                loading={isLogoutLoading}
                onClick={handleLogoutAllSessions}
              >
                Logout All Sessions
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
