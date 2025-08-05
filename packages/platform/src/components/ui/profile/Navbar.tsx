import { IconShield, IconUser } from '@tabler/icons-react';

import { SettingsNavbar } from '#src/components/ui/common/SettingsNavbar';

const navItems = [
  { label: 'General', icon: IconUser, path: '/profile' },
  { label: 'Security', icon: IconShield, path: '/profile/security' },
];

// Custom path matcher for profile navigation
function profilePathMatcher(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/profile') {
    // For the general profile page, only match exact path
    return currentPath === '/profile';
  }
  // For other paths, exact match
  return currentPath === itemPath;
}

export function ProfileNavbar() {
  return (
    <SettingsNavbar
      title="Profile"
      navItems={navItems}
      isActivePathMatcher={profilePathMatcher}
    />
  );
}
