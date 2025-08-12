import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">Manage your settings</p>
      </div>
      <Outlet />
    </>
  );
}
