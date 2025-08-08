import {
  IconApps,
  IconGitBranch,
  IconServer,
  IconUsers,
} from '@tabler/icons-react';

import { SettingsNavbar } from '../common/index.ts';

export function OrganizationNavbar() {
  const navItems = [
    {
      label: 'Environments',
      icon: IconServer,
      path: '/environments',
    },
    {
      label: 'Git Providers',
      icon: IconGitBranch,
      path: '/git-providers',
    },
    {
      label: 'Applications',
      icon: IconApps,
      path: '/applications',
    },
    {
      label: 'Team',
      icon: IconUsers,
      path: '/team',
    },
  ];

  const organizationPathMatcher = (currentPath: string, itemPath: string) => {
    return currentPath === itemPath;
  };

  return (
    <SettingsNavbar
      title="Organization Settings"
      navItems={navItems}
      isActivePathMatcher={organizationPathMatcher}
    />
  );
}
