import { Center, Container } from '@mantine/core';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container>
      <Center>
        <Outlet />
      </Center>
    </Container>
  );
}
