import {
  IconApps,
  IconDatabase,
  IconSettings,
  IconVariable,
} from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';

export function EnvironmentNavbar({
  envSlug,
  basePathPrefix = '/environments',
}: {
  envSlug: string;
  basePathPrefix?: string;
}) {
  const base = `${basePathPrefix}/${envSlug}`;
  const location = useLocation();

  const navItems = [
    {
      label: 'General',
      icon: IconSettings,
      path: `${base}`,
    },
    {
      label: 'Database',
      icon: IconDatabase,
      path: `${base}/database`,
    },
    {
      label: 'Environment Variables',
      icon: IconVariable,
      path: `${base}/environment_variables`,
    },
    {
      label: 'App Installations',
      icon: IconApps,
      path: `${base}/app-installations`,
    },
  ];

  const isActive = (itemPath: string) => {
    // Treat exact match for base tab, startsWith for nested tabs
    if (itemPath === base) return location.pathname === itemPath;
    return location.pathname.startsWith(itemPath);
  };

  return (
    <div className="mb-6 border-b">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-2 text-sm font-semibold text-muted-foreground">
          Environment Settings
        </p>
        <nav className="-mb-px flex flex-wrap items-center gap-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  'inline-flex items-center gap-2 rounded-t-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                <IconComp size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
