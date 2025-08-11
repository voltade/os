import { IconBolt } from '@tabler/icons-react';

import { AppSelector } from './AppSelector.tsx';
import { OrganizationSwitcher } from './OrganizationSwitcher.tsx';
import { UserButton } from './UserButton.tsx';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto max-w-6xl px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <img
            src="https://voltade.com/images/Logo+typo.svg"
            alt="Voltade Logo"
            className="h-6 w-auto" // ~24px tall
          />
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
