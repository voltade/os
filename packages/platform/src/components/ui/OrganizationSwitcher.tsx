import { useNavigate } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@voltade/ui/sidebar.tsx';
import { Check, ChevronsUpDown, Settings, Users } from 'lucide-react';

import { authClient } from '#src/lib/auth.ts';

type Org = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

type OrgSource = { id: string; name?: string | null; logo?: string | null };

export function OrganizationSwitcher() {
  const navigate = useNavigate();
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  const handleSwitchOrganization = async (orgId: string) => {
    await authClient.organization.setActive({
      organizationId: orgId,
    });
  };

  const handleSettings = () => {
    navigate({ to: '/admin' });
  };

  const handleDev = () => {
    navigate({ to: '/dev/environments' });
  };

  // Get current user's role in the organization
  const currentUserMember = activeOrganization?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;

  // Check permissions - admins can see settings but get redirected to team
  const canViewSettings =
    currentUserRole === 'admin' || currentUserRole === 'owner';
  const canViewDeveloper =
    currentUserRole === 'developer' || currentUserRole === 'owner';

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="default"
            className="animate-pulse opacity-70"
            disabled
          >
            <div className="mr-2 aspect-square size-8 rounded-lg bg-muted" />
            <div className="grid flex-1 text-left leading-tight">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-1 h-3 w-16 rounded bg-muted" />
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const orgs: Org[] = (organizations ?? []).map((o: OrgSource) => ({
    id: o.id,
    name: o.name ?? 'Untitled',
    imageUrl: o.logo ?? null,
  }));

  const activeOrg: Org | undefined = activeOrganization
    ? {
        id: activeOrganization.id,
        name: activeOrganization.name ?? 'Untitled',
        imageUrl: activeOrganization.logo ?? null,
      }
    : orgs[0];

  if (!activeOrg) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="default"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <TriggerBadge org={activeOrg} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeOrg.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>

            {orgs.map((org) => {
              const isActive = org.id === activeOrg.id;
              return (
                <DropdownMenuItem
                  key={org.id}
                  className="gap-2 p-2"
                  onClick={() => handleSwitchOrganization(org.id)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <MenuLogo org={org} />
                  </div>
                  <span className="flex-1 truncate">{org.name}</span>
                  {isActive ? <Check className="size-4" /> : null}
                </DropdownMenuItem>
              );
            })}

            {(canViewSettings || canViewDeveloper) && <DropdownMenuSeparator />}
            {canViewSettings && (
              <DropdownMenuItem
                onClick={handleSettings}
                className="cursor-pointer p-2"
              >
                <Settings className="mr-2 size-4" /> Settings
              </DropdownMenuItem>
            )}
            {canViewDeveloper && (
              <DropdownMenuItem
                onClick={handleDev}
                className="cursor-pointer p-2"
              >
                <Users className="mr-2 size-4" /> Developer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function TriggerBadge({ org }: { org: Org }) {
  return (
    <div className="mr-2">
      <Avatar className="size-8 rounded-lg">
        {org.imageUrl ? (
          <AvatarImage src={org.imageUrl} alt={org.name} />
        ) : null}
        <AvatarFallback className="rounded-lg">
          {initials(org.name)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function MenuLogo({ org }: { org: Org }) {
  return (
    <Avatar className="size-5">
      {org.imageUrl ? <AvatarImage src={org.imageUrl} alt={org.name} /> : null}
      <AvatarFallback className="text-[10px]">
        {initials(org.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (a + b).toUpperCase();
}
