import { AppShell, NavLink, Stack, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { useLocation, useNavigate } from '@tanstack/react-router';

interface NavItem {
  label: string;
  icon: Icon;
  path: string;
}

interface SettingsNavbarProps {
  title: string;
  navItems: NavItem[];
  pathPrefix?: string;
  isActivePathMatcher?: (
    currentPath: string,
    itemPath: string,
    pathPrefix?: string,
  ) => boolean;
}

function defaultIsActivePathMatcher(
  currentPath: string,
  itemPath: string,
  pathPrefix?: string,
): boolean {
  if (pathPrefix && itemPath === pathPrefix) {
    // For the base path (like /environments/envSlug), exact match
    return currentPath === itemPath;
  }
  // For sub-paths, check if current path starts with item path
  return currentPath.startsWith(itemPath);
}

export function SettingsNavbar({
  title,
  navItems,
  pathPrefix,
  isActivePathMatcher = defaultIsActivePathMatcher,
}: SettingsNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppShell.Navbar>
      <AppShell.Section>
        <Stack gap="xs" p="xs">
          <Text fw={600} size="sm" c="dimmed">
            {title}
          </Text>
          {navItems.map((item) => (
            <NavLink
              styles={{
                root: {
                  padding: '0.25rem 0.5rem 0.25rem 0.5rem',
                  borderRadius: '0.5rem',
                  '&:hover': {
                    backgroundColor: 'var(--mantine-color-gray-0)',
                  },
                },
              }}
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={isActivePathMatcher(
                location.pathname,
                item.path,
                pathPrefix,
              )}
              onClick={() => navigate({ to: item.path })}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
