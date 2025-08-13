import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@voltade/ui/card.tsx';
import { Package, Plus } from 'lucide-react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { ENVIRONMENT_ID } from '#src/main.tsx';

export const Route = createFileRoute('/_main/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { data: appInstallations, isPending } =
    useAppInstallations(ENVIRONMENT_ID);

  const handleAppClick = (appId: string) => {
    navigate({
      to: '/apps/$appId',
      params: {
        appId,
      },
    });
  };

  if (isPending) {
    return (
      <div className="pt-16 sm:pt-24 lg:pt-32">
        <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: 6 }, (_, index) => `skeleton-${index}`).map(
              (skeletonId) => (
                <div
                  key={skeletonId}
                  className="animate-pulse flex flex-col items-center text-center"
                >
                  <div className="size-16 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-2">
                    <Package size={24} className="text-muted-foreground" />
                  </div>
                  <div className="h-3 bg-muted rounded w-8" />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  const apps = appInstallations || [];

  return (
    <div className="pt-16 sm:pt-24 lg:pt-32">
      {apps.length === 0 ? (
        <div className="text-center p-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No apps installed
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Get started by installing your first application in your
            organisation settings.
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
            {apps.map((appInstallation) => (
              <button
                key={appInstallation.app.id}
                type="button"
                className="group cursor-pointer flex flex-col items-center text-center bg-transparent border-none p-0"
                onClick={() => handleAppClick(appInstallation.app.id)}
                aria-label={`Open ${appInstallation.app.name || 'app'}`}
              >
                <div className="size-16 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-2 group-hover:shadow-md transition-shadow">
                  <Package size={24} className="text-primary" />
                </div>
                <p className="text-xs text-foreground font-medium line-clamp-2">
                  {appInstallation.app.name || 'Unnamed App'}
                </p>
              </button>
            ))}

            {/* Add more apps placeholder */}
            <button
              type="button"
              className="group cursor-pointer flex flex-col items-center text-center bg-transparent border-none p-0"
              aria-label="Add new app"
            >
              <div className="size-16 flex items-center justify-center rounded-lg bg-muted border-2 border-dashed border-border mb-2 group-hover:bg-accent transition-colors">
                <Plus size={20} className="text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Add App
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
