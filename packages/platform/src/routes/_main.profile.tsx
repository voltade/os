import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ProfileNavbar } from '#src/components/ui/profile/Navbar';

export const Route = createFileRoute('/_main/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <ProfileNavbar />
      <Outlet />
    </>
  );
}
