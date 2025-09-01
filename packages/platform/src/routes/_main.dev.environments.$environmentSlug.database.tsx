import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { Skeleton } from '@voltade/ui/skeleton.tsx';
import { Database, ExternalLink, HeartPulse, Info } from 'lucide-react';

import { useEnvironment } from '#src/hooks/environment.ts';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/database',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const {
    data: environment,
    isLoading,
    error,
  } = useEnvironment(environmentSlug);

  const openStudio = () => {
    window.open('/drizzle', '_blank', 'noopener,noreferrer');
  };

  const healthBadgeColor =
    environment?.cnpgStatus.readyInstances === environment?.cnpgStatus.instances
      ? 'bg-emerald-500'
      : environment?.cnpgStatus.readyInstances === 0
        ? 'bg-amber-500'
        : 'bg-red-500';

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="rounded-lg border p-4 space-y-3" />
        </div>
      </div>
    );
  }

  if (error || !environment) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Database size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Environment not found
        </h3>
        <p className="text-sm text-muted-foreground">
          The environment you're looking for doesn't exist or you don't have
          access to it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Database</h2>
          <p className="text-sm text-muted-foreground">
            {environment.name || environment.slug} •{' '}
            {environment.is_production ? 'Production' : 'Development'}
          </p>
        </div>
        <Button onClick={openStudio}>
          <ExternalLink size={16} className="mr-2" /> Open Database Studio
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <HeartPulse size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Status</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${healthBadgeColor}`}
            />
            <span className="text-sm capitalize">
              {environment.cnpgStatus.readyInstances ===
              environment.cnpgStatus.instances
                ? 'healthy'
                : 'degraded'}
            </span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {environment.cnpgStatus.readyInstances} of{' '}
            {environment.cnpgStatus.instances} instances are ready
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Core Schema</span>
          </div>
          <div className="mt-2 text-sm">
            Version{' '}
            <span className="font-mono">{environment.core_schema_version}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Schema and API definitions for apps in this environment
          </div>
        </div>
      </div>
    </div>
  );
}
