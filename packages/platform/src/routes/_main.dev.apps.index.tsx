import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { Skeleton } from '@voltade/ui/skeleton.tsx';
import { Eye, Package, PenLine, Wrench } from 'lucide-react';
import { useState } from 'react';

import {
  CreateAppForm,
  UpdateAppForm,
} from '#src/components/forms/AppForm.tsx';
import { useApps } from '#src/hooks/app.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/apps/')({
  component: RouteComponent,
});

type AppItem = {
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

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const orgId = organisation?.id ?? '';
  const { data: apps, isLoading: isAppsLoading } = useApps(orgId, {
    enabled: !!orgId,
  });

  if (isPending) {
    return <Skeleton className="h-full" />;
  }

  if (isAppsLoading) {
    return (
      <div className="pt-8">
        <div className="w-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
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

  const list = (apps as AppItem[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Applications
        </h2>
        <CreateAppButton />
      </div>

      {list.length === 0 ? (
        <div className="text-center p-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No applications found
          </h3>
          <p className="text-sm text-muted-foreground">
            Build and publish apps to see them here.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {list.map((app) => (
              <AppCard key={app.id} app={app} orgId={orgId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAppButton() {
  const { data: organisation } = authClient.useActiveOrganization();
  const orgId = organisation?.id ?? '';
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Wrench size={16} className="mr-2" /> Add Application
      </Button>
      <CreateAppForm orgId={orgId} open={open} onOpenChange={setOpen} />
    </>
  );
}

function AppCard({ app, orgId }: { app: AppItem; orgId: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border p-3 space-y-3 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 flex items-center justify-center rounded-md bg-card border">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {app.name || 'Unnamed App'}
            </div>
            <div className="text-xs text-muted-foreground">{app.slug}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            title="View Builds"
            onClick={() =>
              navigate({ to: '/dev/apps/$appId', params: { appId: app.id } })
            }
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Edit"
            onClick={() => setOpen(true)}
          >
            <PenLine size={16} />
          </Button>
        </div>
      </div>

      <UpdateAppForm
        orgId={orgId}
        app={app}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
