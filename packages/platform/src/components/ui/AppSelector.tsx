import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@voltade/ui/dropdown-menu.tsx';
import { Grip } from 'lucide-react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { ENVIRONMENT_ID } from '#src/main.tsx';

export function AppSelector() {
  const navigate = useNavigate();
  const { data: appInstallations } = useAppInstallations(ENVIRONMENT_ID);

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
        <div className="grid grid-cols-3 gap-2">
          {appInstallations?.map((app) => (
            <button
              key={app.app.id}
              type="button"
              onClick={() => handleAppClick(app.app.id)}
              className="flex w-full flex-col items-center gap-2 rounded-md p-3 transition-colors hover:bg-accent"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-500 text-white">
                <span className="text-sm font-bold uppercase">
                  {app.app.name?.charAt(0) ?? 'A'}
                </span>
              </div>
              <span className="line-clamp-2 text-center text-xs text-muted-foreground">
                {app.app.name}
              </span>
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
