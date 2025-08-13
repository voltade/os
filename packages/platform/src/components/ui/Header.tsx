import { AppSelector } from './AppSelector.tsx';
import { Logo } from './logo.tsx';
import { OrganizationSwitcher } from './OrganizationSwitcher.tsx';
import { UserButton } from './UserButton.tsx';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="h-12 flex items-center justify-between px-4 md:px-6 xl:px-8">
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
