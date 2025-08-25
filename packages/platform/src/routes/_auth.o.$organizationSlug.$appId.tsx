import { createFileRoute } from '@tanstack/react-router';

import { Header } from '#src/components/ui/PublicHeader.tsx';
import { MicroApp } from '#src/components/utils/micro-app.tsx';

export const Route = createFileRoute('/_auth/o/$organizationSlug/$appId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { organizationSlug, appId } = Route.useParams();

  return (
    <div className="min-h-screen w-full">
      <div className="flex min-h-screen flex-col">
        <Header organizationSlug={organizationSlug} />
        <main className="min-w-0 min-h-[calc(100vh-48px)]">
          <MicroApp slug={appId} />
        </main>
      </div>
    </div>
  );
}
