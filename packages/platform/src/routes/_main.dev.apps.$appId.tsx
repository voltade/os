import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { Skeleton } from '@voltade/ui/skeleton.tsx';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Package,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

import { UpdateAppForm } from '#src/components/forms/AppForm.tsx';
import { useApps } from '#src/hooks/app.ts';
import { useAppBuilds } from '#src/hooks/app_build.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/apps/$appId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { appId } = Route.useParams();
  const { data: organisation, isPending: isOrgPending } =
    authClient.useActiveOrganization();
  const orgId = organisation?.id ?? '';

  const { data: apps, isLoading: isAppsLoading } = useApps(orgId, {
    enabled: !!orgId,
  });

  const { data: builds, isLoading: isBuildsLoading } = useAppBuilds(
    appId,
    orgId,
    {
      enabled: !!appId && !!orgId,
    },
  );

  if (isOrgPending || isAppsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="rounded-lg border p-4 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={`skeleton-detail-${Date.now()}-${index}`}
                className="space-y-2"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`skeleton-build-${Date.now()}-${index}`}
                className="rounded-lg border p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const app = apps?.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Package size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          App not found
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          The app you're looking for doesn't exist.
        </p>
        <Link to="/dev/apps">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Apps
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dev/apps">
            <Button variant="outline" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {app.name || 'Unnamed App'}
            </h1>
            <p className="text-sm text-muted-foreground">{app.slug}</p>
          </div>
        </div>
        <EditAppButton app={app} orgId={orgId} />
      </div>

      {/* App Info */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="text-lg font-medium">App Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Repository:</span>
            <p className="text-muted-foreground">{app.git_repo_url}</p>
          </div>
          <div>
            <span className="font-medium">Branch:</span>
            <p className="text-muted-foreground">{app.git_repo_branch}</p>
          </div>
          <div>
            <span className="font-medium">Path:</span>
            <p className="text-muted-foreground">{app.git_repo_path || '/'}</p>
          </div>
          <div>
            <span className="font-medium">Build Command:</span>
            <p className="text-muted-foreground">{app.build_command}</p>
          </div>
          <div>
            <span className="font-medium">Output Path:</span>
            <p className="text-muted-foreground">{app.output_path}</p>
          </div>
          <div>
            <span className="font-medium">Entrypoint:</span>
            <p className="text-muted-foreground">{app.entrypoint}</p>
          </div>
        </div>
        {app.description && (
          <div>
            <span className="font-medium">Description:</span>
            <p className="text-muted-foreground mt-1">{app.description}</p>
          </div>
        )}
      </div>

      {/* Builds Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Build History</h2>
        </div>

        {isBuildsLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : builds && builds.length > 0 ? (
          <div className="space-y-3">
            {builds.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border rounded-lg">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No builds found
            </h3>
            <p className="text-sm text-muted-foreground">
              Builds will appear here once you start building this app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type BuildType = {
  id: string;
  app_id: string;
  organization_id: string;
  status: 'pending' | 'building' | 'ready' | 'error';
  artifact_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function BuildCard({ build }: { build: BuildType }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'building':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'building':
        return <RefreshCw size={14} className="animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Build #{build.id.slice(-8)}
          </span>
        </div>
        <div
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(build.status)}`}
        >
          {getStatusIcon(build.status)}
          {build.status}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>
            Created:{' '}
            {build.created_at
              ? formatDistanceToNow(new Date(build.created_at), {
                  addSuffix: true,
                })
              : 'Unknown'}
          </span>
        </div>
        {build.updated_at && (
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>
              Updated:{' '}
              {formatDistanceToNow(new Date(build.updated_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}
      </div>

      {build.artifact_url && (
        <div className="pt-2">
          <a
            href={build.artifact_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Download artifact
          </a>
        </div>
      )}
    </div>
  );
}

type AppType = {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
  build_command: string;
  output_path: string;
  entrypoint: string;
  git_repo_url: string;
  git_repo_branch: string;
  git_repo_path: string;
};

function EditAppButton({ app, orgId }: { app: AppType; orgId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Settings size={16} className="mr-2" />
        Edit App
      </Button>
      <UpdateAppForm
        orgId={orgId}
        app={app}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
