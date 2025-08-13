import {
  IconDatabase,
  IconPlus,
  IconSearch,
  IconServer,
} from '@tabler/icons-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { AccessDenied } from '#src/components/utils/access-denied';
import { useEnvironments } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/environments/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: environments, isLoading } = useEnvironments();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  const filteredEnvironments = useMemo(() => {
    if (!environments) return [];
    if (!searchQuery.trim()) return environments;

    return environments.filter(
      (env) =>
        env.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        env.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        env.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [environments, searchQuery]);

  if (!isAllowed) return <AccessDenied />;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading environments...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Environments
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90"
        >
          <IconPlus size={16} />
          Add New Environment
        </button>
      </div>

      <div className="max-w-md">
        <div className="relative">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search environments..."
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm outline-none ring-0 focus:border-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </div>
      </div>

      {filteredEnvironments.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted/50">
            <IconServer size={28} className="opacity-60" />
          </div>
          <p className="text-lg font-medium">
            {searchQuery ? 'No environments found' : 'No environments yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first environment to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEnvironments.map((environment) => (
            <div key={environment.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-lg font-semibold">
                        {environment.name || environment.slug}
                      </p>
                      {environment.is_production && (
                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Production
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {environment.slug}
                    </p>
                    {environment.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {environment.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <IconServer size={14} className="opacity-70" />
                    <span>
                      {environment.runner_count} runner
                      {environment.runner_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconDatabase size={14} className="opacity-70" />
                    <span>
                      {environment.database_instance_count} DB
                      {environment.database_instance_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-2 inline-flex w-full justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() =>
                    navigate({
                      to: '/dev/environments/$environmentSlug',
                      params: { environmentSlug: environment.slug },
                    })
                  }
                >
                  Manage Environment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
