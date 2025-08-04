import {
  IconApps,
  IconDatabase,
  IconSettings,
  IconVariable,
} from '@tabler/icons-react';

import { SettingsNavbar } from '../common/index.ts';

export function EnvironmentNavbar({ envSlug }: { envSlug: string }) {
  const navItems = [
    {
      label: 'General',
      icon: IconSettings,
      path: `/environments/${envSlug}`,
    },
    {
      label: 'Database',
      icon: IconDatabase,
      path: `/environments/${envSlug}/database`,
    },
    {
      label: 'Environment Variables',
      icon: IconVariable,
      path: `/environments/${envSlug}/environment_variables`,
    },
    {
      label: 'App Installations',
      icon: IconApps,
      path: `/environments/${envSlug}/app-installations`,
    },
  ];

  const environmentPathMatcher = (currentPath: string, itemPath: string) => {
    const baseEnvPath = `/environments/${envSlug}`;
    if (itemPath === baseEnvPath) {
      return currentPath === itemPath;
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <SettingsNavbar
      title="Environment Settings"
      navItems={navItems}
      pathPrefix={`/environments/${envSlug}`}
      isActivePathMatcher={environmentPathMatcher}
    />
  );
}
