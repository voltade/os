import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { Database, ExternalLink, HeartPulse, Info } from 'lucide-react';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/database',
)({
  component: RouteComponent,
});

function RouteComponent() {
  // Mocked DB status
  const status = {
    health: 'healthy' as 'healthy' | 'degraded' | 'down',
    connections: 12,
    size: '2.3 GB',
    lastBackup: 'Today, 02:15 UTC',
  };

  // Display version from core-schema (mocked for now)
  const coreSchemaVersion = '0.1.0';

  const openStudio = () => {
    window.open('/drizzle', '_blank', 'noopener,noreferrer');
  };

  const healthBadgeColor =
    status.health === 'healthy'
      ? 'bg-emerald-500'
      : status.health === 'degraded'
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Database
        </h2>
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
            <span className="text-sm capitalize">{status.health}</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {status.connections} connections • {status.size}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Core Schema</span>
          </div>
          <div className="mt-2 text-sm">
            Version <span className="font-mono">{coreSchemaVersion}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Schema and API definitions for the platform
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Migrations</span>
          </div>
          <div className="mt-2 text-sm">Up to date</div>
          <div className="mt-2 text-xs text-muted-foreground">
            Last backup: {status.lastBackup}
          </div>
        </div>
      </div>
    </div>
  );
}
