// src/components/ui/dev/Sidebar.tsx

import { useRouterState } from '@tanstack/react-router';
import React from 'react';

import { SettingsNavbar } from '../common/SettingsNavbar.tsx';

type NavItem = { label: string; path: string };

const navItems: NavItem[] = [
  { label: 'Environments', path: '/dev/environments' },
  { label: 'Git Providers', path: '/dev/git-providers' },
  { label: 'Applications', path: '/dev/applications' },
];

export function DevSidebar() {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const isActive = (current: string, itemPath: string) => {
    return current.startsWith(itemPath);
  };

  return (
    <aside className="w-52 shrink-0 border-r bg-background">
      <div className="px-4 py-5">
        <SettingsNavbar
          title="Developer Tools"
          navItems={navItems}
          pathPrefix={''}
          isActivePathMatcher={isActive}
          showIcons={false}
        />
      </div>
    </aside>
  );
}
