import {
  IconApps,
  IconDatabase,
  IconSettings,
  IconVariable,
} from '@tabler/icons-react';
import { Link, useLocation } from '@tanstack/react-router';

import { SettingsNavbar } from '../common/index.ts';

interface Props {
  envSlug: string;
  basePathPrefix?: string; // visible app path prefix (default /dev/environments)
}

export function EnvironmentSettingsSidebar({
  envSlug,
  basePathPrefix = '/dev/environments',
}: Props) {
  const base = `${basePathPrefix}/${envSlug}`;

  const navItems = [
    { label: 'General', icon: IconSettings, path: `${base}` },
    { label: 'Database', icon: IconDatabase, path: `${base}/database` },
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

  const isActive = (currentPath: string, itemPath: string) => {
    if (itemPath === base) return currentPath === itemPath;
    return currentPath.startsWith(itemPath);
  };

  return (
    <aside className="w-52 shrink-0 border-r bg-background">
      <div className="px-4 py-5">
        <div className="mb-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Environment Settings
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <Link to={'/dev/environments'} className="hover:underline">
              Environments
            </Link>
            <span className="mx-1">/</span>
            <span className="truncate align-middle" title={envSlug}>
              {envSlug}
            </span>
          </div>
        </div>
        <SettingsNavbar
          title=""
          navItems={navItems}
          pathPrefix={base}
          isActivePathMatcher={isActive}
        />
      </div>
    </aside>
  );
}
