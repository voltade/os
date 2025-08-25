import { cn } from '@voltade/ui/lib/utils.ts';

import { authClient } from '#src/lib/auth.ts';
import { AppSelector } from './AppSelector.tsx';
import { EnvironmentSwitcher } from './EnvironmentSwitcher.tsx';
import { Logo } from './logo.tsx';
import { OrganizationSwitcher } from './OrganizationSwitcher.tsx';
import { UserButton } from './UserButton.tsx';

export function Header({ className }: { className?: string }) {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  // Get current user's role in the organization
  const currentUserMember = activeOrganization?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;

  // Check permissions - only developers and owners can see environment switcher
  const canViewEnvironmentSwitcher =
    currentUserRole === 'developer' || currentUserRole === 'owner';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-background w-full h-full',
        className,
      )}
    >
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <div className="flex-shrink-0">
            <Logo navigateTo="/apps" />
          </div>
          <span className="text-muted-foreground flex-shrink-0">/</span>
          <div className="min-w-0">
            <OrganizationSwitcher />
          </div>
          {canViewEnvironmentSwitcher && (
            <>
              <span className="text-muted-foreground flex-shrink-0">/</span>
              <div className="min-w-0">
                <EnvironmentSwitcher />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <AppSelector />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
