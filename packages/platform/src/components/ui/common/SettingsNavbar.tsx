import type { Icon } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';

interface NavItem {
  label: string;
  icon: Icon;
  path: string;
}

interface SettingsNavbarProps {
  title: string;
  navItems: NavItem[];
  pathPrefix?: string;
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
  isActivePathMatcher = defaultIsActivePathMatcher,
}: SettingsNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="h-full w-full">
      <div className="p-2">
        <div className="space-y-2 p-2">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <nav className="space-y-1">
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
                  onClick={() => navigate({ to: item.path })}
                  className={[
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  ].join(' ')}
                >
                  <IconComp size={18} />
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
