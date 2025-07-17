import { AppShell, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { useMemo } from 'react';

import NavBar, {
  NAVBAR_COLLAPSED_WIDTH_PX,
  NAVBAR_WIDTH_PX,
} from '#components/NavBar.tsx';
import TanstackQueryLayout from '../integrations/tanstack-query/layout.tsx';

/**
 * The height of the app header in pixels.
 *
 * This is used to calculate the height of the main content area.
 * It should match the height of the header in the AppShell component.
 *
 * The app header is expected to be specified in the main app.
 */
export const APP_HEADER_HEIGHT_PX = 70;

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const [opened, { toggle }] = useDisclosure(true);

    const nodeEnv = import.meta.env.VITE_NODE_ENV ?? 'production';

    // region App outlet
    const applet = useMemo(
      () => (
        <AppShell
          padding="xl"
          navbar={{
            width: opened ? NAVBAR_WIDTH_PX : NAVBAR_COLLAPSED_WIDTH_PX,
            breakpoint: 0,
          }}
        >
          <AppShell.Navbar>
            <NavBar opened={opened} toggleOpen={toggle} />
          </AppShell.Navbar>

          <AppShell.Main>
            <Outlet />
          </AppShell.Main>
        </AppShell>
      ),
      [opened, toggle],
    );
    // endregion

    return nodeEnv === 'development' ? (
      <>
        <AppShell header={{ height: APP_HEADER_HEIGHT_PX }}>
          <AppShell.Header>
            <Group
              align="center"
              justify="center"
              gap="md"
              h="100%"
              style={{ backgroundColor: 'gray' }}
            >
              <Text c="white" fw={700} size="md">
                Sample header, do not modify. Will not be visible in production.
              </Text>
            </Group>
          </AppShell.Header>
          {applet}
        </AppShell>
        <TanStackRouterDevtools />
        <TanstackQueryLayout />
      </>
    ) : (
      applet
    );
  },
});
