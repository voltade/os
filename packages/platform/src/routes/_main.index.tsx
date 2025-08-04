import { Button } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const onClick = () => {
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

  return <Button onClick={onClick}>Sign out</Button>;
}
