import { Center, Container } from '@mantine/core';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Container py="lg">
      <Center>
        <Outlet />
      </Center>
    </Container>
  );
}
