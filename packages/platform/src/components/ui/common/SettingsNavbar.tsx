import type { Icon } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';

interface NavItem {
  label: string;
  path: string;
  icon?: Icon;
  external?: boolean;
}

interface SettingsNavbarProps {
  title?: string;
  navItems: NavItem[];
  pathPrefix?: string;
  showIcons?: boolean;
  isActivePathMatcher?: (
    currentPath: string,
    itemPath: string,
    pathPrefix?: string,
  ) => boolean;
}

function defaultIsActivePathMatcher(
  currentPath: string,
  itemPath: string,
  pathPrefix?: string,
): boolean {
  if (pathPrefix && itemPath === pathPrefix) {
    return currentPath === itemPath;
  }
  return currentPath.startsWith(itemPath);
}

export function SettingsNavbar({
  title,
  navItems,
  pathPrefix,
  showIcons = false,
  isActivePathMatcher = defaultIsActivePathMatcher,
}: SettingsNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="h-full w-full">
      <div className="p-4">
        <div className="space-y-3">
          {title ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
          ) : null}
          <nav className="space-y-1 mt-4">
            {navItems.map((item) => {
              const active = isActivePathMatcher(
                location.pathname,
                item.path,
                pathPrefix,
              );
              const IconComp = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    if (item.external) {
                      window.open(item.path, '_blank');
                    } else {
                      navigate({ to: item.path });
                    }
                  }}
                  className={[
                    'group flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors whitespace-nowrap',
                    active
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  {showIcons && IconComp ? (
                    <span className="inline-flex size-4 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground">
                      <IconComp size={12} />
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
