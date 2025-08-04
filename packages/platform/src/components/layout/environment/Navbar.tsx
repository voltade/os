import { AppShell, Button, Divider, Stack, Text } from '@mantine/core';

export function Navbar() {
  return (
    <AppShell.Navbar>
      <AppShell.Section>
        <Stack>
          <Text>Switch Environment</Text>
        </Stack>
      </AppShell.Section>
      <Divider />
      <AppShell.Section>
        <Stack>
          <Text fw={500}>Environment Settings</Text>
          <Text>Environment Variables</Text>
          <Text>App Installations</Text>
        </Stack>
      </AppShell.Section>
      <Divider />
      <AppShell.Section
        style={{
          position: 'sticky',
          bottom: 0,
        }}
      >
        <Button>Logout</Button>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
