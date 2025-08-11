import {
  IconApps,
  IconDatabase,
  IconSettings,
  IconVariable,
} from '@tabler/icons-react';

import { SettingsNavbar } from '../common/index.ts';

export function EnvironmentNavbar({
  envSlug,
  basePathPrefix = '/environments',
}: {
  envSlug: string;
  basePathPrefix?: string;
}) {
  const base = `${basePathPrefix}/${envSlug}`;
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

  const environmentPathMatcher = (currentPath: string, itemPath: string) => {
    const baseEnvPath = `${base}`;
    if (itemPath === baseEnvPath) {
      return currentPath === itemPath;
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <SettingsNavbar
      title="Environment Settings"
      navItems={navItems}
      pathPrefix={base}
      isActivePathMatcher={environmentPathMatcher}
    />
  );
}
