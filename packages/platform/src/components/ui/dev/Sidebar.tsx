// src/components/ui/dev/Sidebar.tsx

import { IconApps, IconBrandGit, IconServer } from '@tabler/icons-react';
import { Link, useRouterState } from '@tanstack/react-router';
import type React from 'react';

type NavItem = { label: string; path: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  {
    label: 'Environments',
    path: '/dev/environments',
    icon: <IconServer size={16} />,
  },
  {
    label: 'Git Providers',
    path: '/dev/git-providers',
    icon: <IconBrandGit size={16} />,
  },
  {
    label: 'Applications',
    path: '/dev/applications',
    icon: <IconApps size={16} />,
  },
  // removed: { label: 'Team', path: '/team' },
];

export function DevSidebar() {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const isActive = (p: string) => currentPath === p;

  return (
    <aside className="w-52 shrink-0 border-r bg-background">
      <div className="px-4 py-5">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Developer Tools
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? 'page' : undefined}
                className={[
                  'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                ].join(' ')}
              >
                <span className="inline-flex size-5 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
