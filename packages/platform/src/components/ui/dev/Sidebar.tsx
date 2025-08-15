import { NavigationSidebar } from '../common/NavigationSidebar.tsx';

type NavItem = { label: string; path: string };

const navItems: NavItem[] = [
  { label: 'Environments', path: '/dev/environments' },
  { label: 'Git Providers', path: '/dev/git-providers' },
  { label: 'Applications', path: '/dev/apps' },
];

export function DevSidebar() {
  const isActive = (current: string, itemPath: string) => {
    return current.startsWith(itemPath);
  };

  return (
    <NavigationSidebar
      title="Developer Tools"
      navItems={navItems}
      pathPrefix={''}
      isActivePathMatcher={isActive}
      showIcons={false}
    />
  );
}
