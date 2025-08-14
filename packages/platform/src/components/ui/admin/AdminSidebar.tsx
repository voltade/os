import { NavigationSidebar } from '#src/components/ui/common/NavigationSidebar.tsx';

const adminNavItems = [
  {
    label: 'General',
    path: '/admin',
  },
  {
    label: 'Team',
    path: '/admin/team',
  },
];

export function AdminSidebar() {
  return (
    <NavigationSidebar
      title="Organization Settings"
      navItems={adminNavItems}
      pathPrefix="/admin"
      showIcons={false}
    />
  );
}
