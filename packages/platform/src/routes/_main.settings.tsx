import { createFileRoute, Outlet } from '@tanstack/react-router';

import { SettingsSidebar } from '#src/components/ui/settings/SettingsSidebar.tsx';

export const Route = createFileRoute('/_main/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-[calc(100dvh-theme(spacing.24))] gap-6">
      <SettingsSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
