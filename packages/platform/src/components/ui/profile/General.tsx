import {
  Avatar,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

import { authClient } from '#src/lib/auth';

export function ProfileGeneral() {
  const { data: sessionData } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: sessionData?.user?.name || '',
      email: sessionData?.user?.email || '',
      image: sessionData?.user?.image || '',
    },
    validate: {
      name: (value) =>
        value.length < 2 ? 'Name must be at least 2 characters' : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      image: (value) => {
        if (value && !value.startsWith('http')) {
          return 'Image must be a valid URL';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.updateUser({
        name: values.name,
        image: values.image,
      });

      if (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to update profile',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionData?.user) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack gap="md">
      <Card withBorder p="0" radius="md" shadow="sm">
        <Stack p="md" gap="xs">
          <Title order={3}>Profile</Title>
          <Text size="sm" c="dimmed">
            Manage your personal information.
          </Text>
        </Stack>
        <Divider />
        <Stack p="md" gap="lg">
          <Group align="center">
            <Avatar src={sessionData.user.image} size="xl" radius="md">
              {sessionData.user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Stack gap={4}>
              <Text fw={500}>{sessionData.user.name}</Text>
              <Text size="sm" c="dimmed">
                {sessionData.user.email}
              </Text>
            </Stack>
          </Group>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="Enter your name"
                key={form.key('name')}
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Profile Image URL"
                placeholder="Enter image URL (optional)"
                key={form.key('image')}
                {...form.getInputProps('image')}
                description="Provide a URL to your profile image"
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                disabled
                key={form.key('email')}
                {...form.getInputProps('email')}
                description="Email is managed by your authentication provider and cannot be changed here."
              />

              <Group justify="flex-end">
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!form.isDirty()}
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
}
