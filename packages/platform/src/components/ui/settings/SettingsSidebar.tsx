import { NavigationSidebar } from '../common/index.ts';

export function SettingsSidebar() {
  const navItems = [
    {
      label: 'General',
      path: '/settings',
    },
    {
      label: 'Organizations',
      path: '/settings/organizations',
    },
  ];

  const isActive = (currentPath: string, itemPath: string) => {
    if (itemPath === '/settings') return currentPath === itemPath;
    return currentPath.startsWith(itemPath);
  };

  return (
    <NavigationSidebar
      title="Settings"
      navItems={navItems}
      pathPrefix="/settings"
      isActivePathMatcher={isActive}
      showIcons={false}
    />
  );
}
