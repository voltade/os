import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

export const Route = createRootRouteWithContext()({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
