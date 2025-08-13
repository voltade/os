import { createFileRoute } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Card, CardContent } from '@voltade/ui/card.tsx';
import { Crown, User } from 'lucide-react';

import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/settings/organizations')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  if (isPending) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="text-sm text-muted-foreground">
            Manage the organizations you're a member of
          </p>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, i) => `skeleton-${i}`).map((key) => (
            <Card key={key} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-muted rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-32 mb-2" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const orgs = organizations || [];

  const getUserRole = (org: {
    members?: { userId: string; role: string }[];
  }) => {
    const member = org.members?.find((m) => m.userId === session?.user?.id);
    return member?.role || 'member';
  };

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (a + b).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
        <p className="text-sm text-muted-foreground">
          Manage the organizations you're a member of
        </p>
      </div>

      <div className="space-y-4">
        {orgs.map((org) => {
          const isActive = org.id === activeOrganization?.id;
          const userRole = getUserRole(org);

          return (
            <Card
              key={org.id}
              className={isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-12 rounded-lg">
                    {org.logo ? (
                      <AvatarImage
                        src={org.logo}
                        alt={org.name || 'Organization'}
                      />
                    ) : null}
                    <AvatarFallback className="rounded-lg">
                      {initials(org.name || 'Organization')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {org.name || 'Untitled Organization'}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {userRole === 'owner' ? (
                          <Crown size={14} className="text-amber-500" />
                        ) : (
                          <User size={14} />
                        )}
                        <span className="capitalize">{userRole}</span>
                      </div>

                      <span>•</span>

                      <span>
                        {org.members?.length || 0} member
                        {org.members?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {orgs.length === 0 && (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No organizations
            </h3>
            <p className="text-sm text-muted-foreground">
              You're not a member of any organizations yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
