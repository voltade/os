import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@voltade/ui/sidebar.tsx';
import { Check, ChevronsUpDown } from 'lucide-react';

import { useEnvironments } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

type Environment = {
  id: string;
  slug: string;
  name: string | null;
  is_production: boolean;
};

export function EnvironmentSwitcher() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: environments, isPending } = useEnvironments(
    activeOrganization?.id ?? '',
  );
  const { environment, setEnvironment } = usePlatformStore();

  const handleSwitchEnvironment = (envSlug: string, envId: string) => {
    setEnvironment(envSlug, envId);
  };

  if (isPending || !environments?.length || !activeOrganization?.id) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="default"
            className="animate-pulse opacity-70"
            disabled
          >
            <div className="grid flex-1 text-left leading-tight">
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const activeEnv =
    environments.find((env: Environment) => env.id === environment.id) ||
    environments[0];

  if (!activeEnv) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="default"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeEnv.name || activeEnv.slug}
                </span>
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
              Environments
            </DropdownMenuLabel>

            {environments.map((env: Environment) => {
              const isActive = env.id === activeEnv.id;
              return (
                <DropdownMenuItem
                  key={env.id}
                  className="gap-2 p-2"
                  onClick={() => handleSwitchEnvironment(env.slug, env.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`size-2 rounded-full ${env.is_production ? 'bg-destructive' : 'bg-chart-1'}`}
                    />
                    <span className="flex-1 truncate">
                      {env.name || env.slug}
                    </span>
                  </div>
                  {isActive ? <Check className="size-4" /> : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
