import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';

import { usePublicOrganisation } from '#src/hooks/public_organisation.ts';
import { Logo } from './logo.tsx';

interface HeaderProps {
  organizationSlug: string;
}

export function Header({ organizationSlug }: HeaderProps) {
  const { data: organisation, isLoading } =
    usePublicOrganisation(organizationSlug);

  return (
    <header className="sticky top-0 z-40 border-b bg-background w-full h-12">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
          <div className="flex-shrink-0">
            <Logo navigateTo="/apps" />
          </div>
          <span className="text-muted-foreground flex-shrink-0">/</span>
          <div className="min-w-0">
            <ActiveOrganizationDisplay
              org={organisation}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

type Org = {
  slug: string;
  name: string;
  logo: string | null;
};

function ActiveOrganizationDisplay({
  org,
  isLoading,
}: {
  org?: Org | null;
  isLoading: boolean;
}) {
  if (isLoading || !org) {
    return (
      <div className="flex items-center">
        <div className="mr-2 aspect-square size-6 rounded-lg bg-muted animate-pulse" />
        <div className="grid flex-1 text-left leading-tight">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div className="mr-2">
        <Avatar className="size-6 rounded-lg">
          {org.logo ? <AvatarImage src={org.logo} alt={org.name} /> : null}
          <AvatarFallback className="rounded-lg">
            {initials(org.name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{org.name}</span>
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (a + b).toUpperCase();
}
