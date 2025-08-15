import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { Package, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AccessDenied } from '#src/components/utils/access-denied.tsx';
import { Loading } from '#src/components/utils/loading.tsx';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { useApps } from '#src/hooks/app.ts';
import { useAppBuilds } from '#src/hooks/app_build.ts';
import {
  type AppInstallation,
  useAppInstallations,
  useInstallApp,
  useUninstallApp,
  useUpdateInstallationBuild,
} from '#src/hooks/app_installation.ts';
import { useEnvironment } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/app-installations',
)({
  component: RouteComponent,
});

function formatTimestamp(ts?: string | null) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

function RouteComponent() {
  const { environmentSlug } = Route.useParams();

  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const { data: environment, isLoading: isEnvLoading } =
    useEnvironment(environmentSlug);
  const { data: appInstallations, isLoading: isAppsLoading } =
    useAppInstallations(environment?.id ?? '');
  const orgId = organisation?.id ?? '';
  const { data: apps } = useApps(orgId, { enabled: !!orgId });

  const [installOpen, setInstallOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const { data: availableBuilds } = useAppBuilds(selectedAppId ?? '', orgId, {
    enabled: !!selectedAppId && !!orgId,
  });

  const installMutation = useInstallApp();
  const uninstallMutation = useUninstallApp();
  const updateBuildMutation = useUpdateInstallationBuild();

  const installations = appInstallations || [];

  const availableApps = useMemo(() => {
    const installedIds = new Set(installations.map((i) => i.app.id));
    return (apps ?? []).filter((a) => !installedIds.has(a.id));
  }, [apps, installations]);

  if (isPending || isEnvLoading) {
    return <Loading fullHeight message="Loading app installations..." />;
  }

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';
  if (!isAllowed) return <AccessDenied />;

  if (!environment) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        Environment not found
      </div>
    );
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

  const handleUninstall = async (appId: string) => {
    if (!environment || !organisation) return;
    try {
      await uninstallMutation.mutateAsync({
        app_id: appId,
        environment_id: environment.id,
        org_id: organisation.id,
      });
      showSuccess('App uninstalled');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to uninstall app');
    }
  };

  const handleInstall = async () => {
    if (!environment || !organisation || !selectedAppId || !selectedBuildId)
      return;
    try {
      await installMutation.mutateAsync({
        app_id: selectedAppId,
        app_build_id: selectedBuildId,
        environment_id: environment.id,
        organization_id: organisation.id,
      });
      showSuccess('App installed');
      setInstallOpen(false);
      setSelectedAppId(null);
      setSelectedBuildId(null);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to install app');
    }
  };

  const handleChangeBuild = async (appId: string, app_build_id: string) => {
    if (!environment || !organisation) return;
    try {
      await updateBuildMutation.mutateAsync({
        app_id: appId,
        app_build_id,
        environment_id: environment.id,
        organization_id: organisation.id,
      });
      showSuccess('App build updated');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update build');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">App Installations</h2>
        <Button size="sm" onClick={() => setInstallOpen(true)}>
          <Plus size={16} className="mr-2" /> Install App
        </Button>
      </div>

      {installations.length === 0 ? (
        <div className="text-center p-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No apps installed
          </h3>
          <p className="text-sm text-muted-foreground">
            Install apps to use them in this environment.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {installations.map((inst) => (
              <InstallationCard
                key={inst.app.id}
                inst={inst}
                orgId={orgId}
                onUninstall={handleUninstall}
                onChangeBuild={handleChangeBuild}
              />
            ))}
          </div>
        </div>
      )}

      <Dialog open={installOpen} onOpenChange={setInstallOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">App</div>
              <Select
                value={selectedAppId ?? ''}
                onValueChange={(v) => {
                  setSelectedAppId(v);
                  setSelectedBuildId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select app" />
                </SelectTrigger>
                <SelectContent>
                  {(availableApps || []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name || a.slug || a.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Build</div>
              <Select
                value={selectedBuildId ?? ''}
                onValueChange={setSelectedBuildId}
                disabled={!selectedAppId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select build" />
                </SelectTrigger>
                <SelectContent>
                  {(availableBuilds || []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex flex-col">
                        <span>
                          {b.id} — {b.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(b.created_at) ||
                            formatTimestamp(b.updated_at)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInstallOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInstall}
              disabled={!selectedAppId || !selectedBuildId}
            >
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InstallationCard({
  inst,
  orgId,
  onUninstall,
  onChangeBuild,
}: {
  inst: AppInstallation;
  orgId: string;
  onUninstall: (appId: string) => void;
  onChangeBuild: (appId: string, buildId: string) => void;
}) {
  const { data: builds } = useAppBuilds(inst.app.id, orgId, {
    enabled: !!orgId,
  });

  return (
    <div className="rounded-lg border p-3 space-y-2 flex flex-col">
      <div className="flex items-center justify-between flex-1">
        <div className="flex items-center gap-2">
          <div className="size-10 flex items-center justify-center rounded-md bg-card border">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {inst.app.name || 'Unnamed App'}
            </div>
            <div className="text-xs text-muted-foreground">{inst.app.slug}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="icon"
            title="Uninstall"
            onClick={() => onUninstall(inst.app.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <div>
        <div className="text-xs mb-1 text-muted-foreground">Build</div>
        <div className="flex items-center gap-2">
          <Select
            value={inst.app_installation.app_build_id}
            onValueChange={(value) => onChangeBuild(inst.app.id, value)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select build" />
            </SelectTrigger>
            <SelectContent>
              {(builds || []).map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  <div className="flex flex-col">
                    <span>
                      {b.id} — {b.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(b.created_at) ||
                        formatTimestamp(b.updated_at)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
