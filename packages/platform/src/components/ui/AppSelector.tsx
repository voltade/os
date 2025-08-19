import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import { CodeIcon, Grip, Package, PackageIcon } from 'lucide-react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

export function AppSelector() {
  const { environment } = usePlatformStore();
  const { data: appInstallations } = useAppInstallations(environment.id);

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
      <DropdownMenuPortal>
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
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link
                  to="/apps/$slug"
                  params={{ slug: 'app-template' }}
                  type="button"
                  className="flex w-full flex-col items-center gap-1 rounded-md p-2 transition-colors"
                  aria-label="Open [Dev] Template"
                >
                  <div className="size-12 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-1">
                    <CodeIcon size={24} className="text-primary" />
                  </div>
                  <span className="line-clamp-2 text-center text-xs text-muted-foreground">
                    [Dev] Template
                  </span>
                </Link>
              </DropdownMenuItem>
              {appInstallations?.map(({ app }) => (
                <DropdownMenuItem
                  key={app.id}
                  asChild
                  className="cursor-pointer"
                >
                  <Link
                    to="/apps/$slug"
                    params={{ slug: app.slug }}
                    type="button"
                    className="flex w-full flex-col items-center gap-1 rounded-md p-2 transition-colors"
                    aria-label={`Open ${app.name || 'Unnamed App'}`}
                  >
                    <div className="size-12 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-1">
                      <PackageIcon size={24} className="text-primary" />
                    </div>
                    <span className="line-clamp-2 text-center text-xs text-muted-foreground">
                      {app.name || 'Unnamed App'}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
