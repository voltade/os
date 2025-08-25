import { createFileRoute } from '@tanstack/react-router';

import { Header } from '#src/components/ui/PublicHeader.tsx';
import { PublicMicroApp } from '#src/components/utils/public-micro-app.tsx';

export const Route = createFileRoute('/_auth/o/$organizationSlug/$appSlug')({
  component: RouteComponent,
});

function RouteComponent() {
  const { organizationSlug, appSlug } = Route.useParams();

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col">
        <Header organizationSlug={organizationSlug} />
        <main className="min-w-0 min-h-[calc(100vh-48px)]">
          <PublicMicroApp
            appSlug={appSlug}
            organizationSlug={organizationSlug}
          />
        </main>
      </div>
    </div>
  );
}
