import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeIcon, PackageIcon, PlusIcon } from 'lucide-react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

export const Route = createFileRoute('/_main/apps/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { environment } = usePlatformStore();
  const { data: appInstallations, isPending } = useAppInstallations(
    environment.id,
  );
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
                    <PackageIcon size={24} className="text-muted-foreground" />
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

  return (
    <div className="pt-16 sm:pt-24 lg:pt-32">
      {appInstallations?.length === 0 &&
      import.meta.env.MODE !== 'development' ? (
        <div className="text-center p-12">
          <PackageIcon
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
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
            <Link
              to="/apps/$slug"
              params={{ slug: 'app-template' }}
              type="button"
              className="group cursor-pointer flex flex-col items-center text-center bg-transparent border-none p-0"
              aria-label="Open [Dev] Template"
            >
              <div className="size-16 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-2 group-hover:shadow-md transition-shadow">
                <CodeIcon size={24} className="text-primary" />
              </div>
              <p className="text-xs text-foreground font-medium line-clamp-2">
                [Dev] Template
              </p>
            </Link>
            {appInstallations?.map(({ app }) => (
              <Link
                key={app.id}
                to="/apps/$slug"
                params={{ slug: app.slug }}
                type="button"
                className="group cursor-pointer flex flex-col items-center text-center bg-transparent border-none p-0"
                aria-label={`Open ${app.name || 'Unnamed App'}`}
              >
                <div className="size-16 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-2 group-hover:shadow-md transition-shadow">
                  <PackageIcon size={24} className="text-primary" />
                </div>
                <p className="text-xs text-foreground font-medium line-clamp-2">
                  {app.name || 'Unnamed App'}
                </p>
              </Link>
            ))}

            {/* Add more apps placeholder */}
            <button
              type="button"
              className="group cursor-pointer flex flex-col items-center text-center bg-transparent border-none p-0"
              aria-label="Add new app"
            >
              <div className="size-16 flex items-center justify-center rounded-lg bg-muted border-2 border-dashed border-border mb-2 group-hover:bg-accent transition-colors">
                <PlusIcon size={20} className="text-muted-foreground" />
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
