import { Database, Grid3X3, Settings, Variable } from 'lucide-react';

import { NavigationSidebar } from '../common/index.ts';

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
    { label: 'General', icon: Settings, path: `${base}` },
    { label: 'Database', icon: Database, path: `${base}/database` },
    {
      label: 'Environment Variables',
      icon: Variable,
      path: `${base}/environment_variables`,
    },
    {
      label: 'App Installations',
      icon: Grid3X3,
      path: `${base}/app-installations`,
    },
  ];

  const isActive = (currentPath: string, itemPath: string) => {
    if (itemPath === base) return currentPath === itemPath;
    return currentPath.startsWith(itemPath);
  };

  return (
    <NavigationSidebar
      title="Environment Settings"
      navItems={navItems}
      pathPrefix={base}
      isActivePathMatcher={isActive}
      showIcons={false}
    />
  );
}
