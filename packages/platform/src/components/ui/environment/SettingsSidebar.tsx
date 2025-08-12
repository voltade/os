import {
  IconApps,
  IconDatabase,
  IconSettings,
  IconVariable,
} from '@tabler/icons-react';

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
        <SettingsNavbar
          title="Environment Settings"
          navItems={navItems}
          pathPrefix={base}
          isActivePathMatcher={isActive}
          showIcons={false}
        />
      </div>
    </aside>
  );
}
