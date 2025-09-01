import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

export const Route = createRootRouteWithContext()({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-7xl p-4 lg:px-8">
      <Outlet />
    </div>
  );
}
