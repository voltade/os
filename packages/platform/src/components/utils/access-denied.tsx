import { Stack, Text, Title } from '@mantine/core';

export function AccessDenied() {
  return (
    <Stack justify="center" align="center" h="60vh">
      <Title order={2}>Access Denied</Title>
      <Text c="dimmed">You do not have permission to access this page.</Text>
    </Stack>
  );
}
