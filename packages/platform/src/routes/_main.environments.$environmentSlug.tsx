import { createFileRoute, Outlet } from '@tanstack/react-router';

import { EnvironmentNavbar } from '#src/components/ui/environment/Navbar';

export const Route = createFileRoute('/_main/environments/$environmentSlug')({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  return (
    <>
      <EnvironmentNavbar envSlug={environmentSlug} />
      <Outlet />
    </>
  );
}
