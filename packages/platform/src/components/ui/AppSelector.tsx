import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import { Grip, Package } from 'lucide-react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

export function AppSelector() {
  const navigate = useNavigate();
  const { environment } = usePlatformStore();
  const { data: appInstallations } = useAppInstallations(environment.id);

  const handleAppClick = (appId: string) => {
    navigate({
      to: '/apps/$appId',
      params: {
        appId,
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
          aria-label="Open apps menu"
        >
          <Grip size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px] p-3">
        {!appInstallations || appInstallations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              No apps installed
            </p>
            <p className="text-xs text-muted-foreground">
              Install apps to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {appInstallations.map((app) => (
              <button
                key={app.app.id}
                type="button"
                onClick={() => handleAppClick(app.app.id)}
                className="flex w-full flex-col items-center gap-1 rounded-md p-2 transition-colors hover:bg-accent"
              >
                <div className="size-12 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-1">
                  <Package size={20} className="text-primary" />
                </div>
                <span className="line-clamp-2 text-center text-xs text-muted-foreground">
                  {app.app.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
