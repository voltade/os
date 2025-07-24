import { Button } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import { ory } from '#src/lib/ory.ts';

export const Route = createFileRoute('/_main/welcome')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Button
      onClick={async () => {
        try {
          const logoutFlow = await ory.createBrowserLogoutFlow();
          // Use the received token to "update" the flow and thus perform the logout
          await ory.updateLogoutFlow({
            token: logoutFlow.logout_token,
            returnTo: undefined,
          });
        } catch (error) {
          console.error(error);
        } finally {
          window.location.href = '/login';
        }
      }}
    >
      Logout
    </Button>
  );
}
