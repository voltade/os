// src/components/ui/dev/Sidebar.tsx
import { Link, useRouterState } from '@tanstack/react-router';

type NavItem = { label: string; path: string };

const navItems: NavItem[] = [
  { label: 'Environments', path: '/dev/environments' },
  { label: 'Git Providers', path: '/dev/git-providers' },
  { label: 'Applications', path: '/dev/applications' },
  // removed: { label: 'Team', path: '/team' },
];

export function DevSidebar() {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const isActive = (p: string) => currentPath === p;

  return (
    <aside className="w-64 shrink-0 border-r bg-background">
      <div className="px-4 py-5">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Developer Tools
        </h2>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={[
                'block rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive(item.path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
