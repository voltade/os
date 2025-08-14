import { cn } from '@voltade/ui/lib/utils.ts';

import { AppSelector } from './AppSelector.tsx';
import { Logo } from './logo.tsx';
import { OrganizationSwitcher } from './OrganizationSwitcher.tsx';
import { UserButton } from './UserButton.tsx';

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background w-full h-full',
        className,
      )}
    >
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm">
          <Logo />
          <span className="text-muted-foreground">/</span>
          <OrganizationSwitcher />
        </div>

        <div className="flex items-center gap-3">
          <AppSelector />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
