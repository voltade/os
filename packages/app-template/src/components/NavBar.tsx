import {
  ActionIcon,
  Burger,
  Group,
  NavLink,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useCallback, useState } from 'react';

export const NAVBAR_WIDTH_PX = 250;
export const NAVBAR_COLLAPSED_WIDTH_PX = 60;

// Define routes
export const HOME_ROUTE = '/';

// Define route display names
const HOME_ROUTE_NAME = 'Home';

export interface NavBarProps {
  opened?: boolean;
  toggleOpen: () => void;
}

const NavBar: React.FC<NavBarProps> = (props: NavBarProps) => {
  const navigate = useNavigate();
  const { opened, toggleOpen } = props;

  const [activeTab, setActiveTab] = useState<string>(
    window.location.href.slice(window.location.href.lastIndexOf('/')) ??
      HOME_ROUTE,
  );

  // region Handlers
  const handleSetActiveTab = useCallback(
    (tabValue: string | null) => {
      setActiveTab(tabValue ?? HOME_ROUTE);
      navigate({ to: tabValue ?? HOME_ROUTE });
    },
    [navigate],
  );
  // endregion

  // region Render
  return (
    <Stack
      h="100%"
      w={opened ? NAVBAR_WIDTH_PX : NAVBAR_COLLAPSED_WIDTH_PX}
      pt="xl"
      pb="lg"
      px="md"
      justify="space-between"
      gap="lg"
    >
      <Stack gap="xl">
        <Group w="100%" justify="space-between" gap="md">
          <Burger
            size="sm"
            opened={opened}
            onClick={toggleOpen}
            aria-label="Toggle navbar"
          />
        </Group>

        <Stack gap={opened ? 'sm' : 'md'}>
          {opened ? (
            <NavLink
              label={<Text size="lg">{HOME_ROUTE_NAME}</Text>}
              variant="light"
              leftSection={<IconHome size={24} stroke={1.5} />}
              active={activeTab === HOME_ROUTE}
              onClick={() => handleSetActiveTab(HOME_ROUTE)}
            />
          ) : (
            <Tooltip
              label={HOME_ROUTE_NAME}
              position="right"
              withArrow
              arrowSize={4}
            >
              <ActionIcon
                variant="transparent"
                onClick={() => handleSetActiveTab(HOME_ROUTE)}
              >
                <IconHome
                  size={24}
                  stroke={1.5}
                  color={activeTab === HOME_ROUTE ? undefined : 'black'}
                />
              </ActionIcon>
            </Tooltip>
          )}
          {/** TODO: Add more tabs to the navbar here */}
        </Stack>
      </Stack>
    </Stack>
  );
  // endregion
};

export default NavBar;
