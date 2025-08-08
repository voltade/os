import {
  ActionIcon,
  Burger,
  Group,
  NavLink,
  Stack,
  Tooltip,
} from '@mantine/core';
import { IconHome, IconTable, IconUserPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useCallback, useState } from 'react';

export const NAVBAR_WIDTH_PX = 250;
export const NAVBAR_COLLAPSED_WIDTH_PX = 60;

// Define routes
export const HOME_ROUTE = '/';
export const PRODUCT_TEMPLATES_TABLE_ROUTE = '/product-templates';
export const REGISTRATION_FORM_ROUTE = '/registration-form';
export const STUDENTS_ROUTE = '/students';

// Define route display names
const HOME_ROUTE_NAME = 'Home';
const PRODUCT_TEMPLATES_TABLE_ROUTE_NAME = 'Product Templates';
export const REGISTRATION_FORM_ROUTE_NAME = 'Registration Form';
export const STUDENTS_ROUTE_NAME = 'Students';

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
            <Stack gap={0}>
              <NavLink
                label={HOME_ROUTE_NAME}
                variant="light"
                leftSection={<IconHome size={18} stroke={1.5} />}
                active={activeTab === HOME_ROUTE}
                onClick={() => handleSetActiveTab(HOME_ROUTE)}
              />
              <NavLink
                label={PRODUCT_TEMPLATES_TABLE_ROUTE_NAME}
                variant="light"
                leftSection={<IconTable size={18} stroke={1.5} />}
                active={activeTab === PRODUCT_TEMPLATES_TABLE_ROUTE}
                onClick={() =>
                  handleSetActiveTab(PRODUCT_TEMPLATES_TABLE_ROUTE)
                }
              />
              <NavLink
                label={REGISTRATION_FORM_ROUTE_NAME}
                variant="light"
                leftSection={<IconUserPlus size={18} stroke={1.5} />}
                active={activeTab === REGISTRATION_FORM_ROUTE}
                onClick={() => handleSetActiveTab(REGISTRATION_FORM_ROUTE)}
              />
              <NavLink
                label={STUDENTS_ROUTE_NAME}
                variant="light"
                leftSection={<IconTable size={18} stroke={1.5} />}
                active={activeTab === STUDENTS_ROUTE}
                onClick={() => handleSetActiveTab(STUDENTS_ROUTE)}
              />
            </Stack>
          ) : (
            <Stack>
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
              <Tooltip
                label={PRODUCT_TEMPLATES_TABLE_ROUTE_NAME}
                position="right"
                withArrow
                arrowSize={4}
              >
                <ActionIcon
                  variant="transparent"
                  onClick={() =>
                    handleSetActiveTab(PRODUCT_TEMPLATES_TABLE_ROUTE)
                  }
                >
                  <IconTable
                    size={24}
                    stroke={1.5}
                    color={
                      activeTab === PRODUCT_TEMPLATES_TABLE_ROUTE
                        ? undefined
                        : 'black'
                    }
                  />
                </ActionIcon>
              </Tooltip>
              <Tooltip
                label={REGISTRATION_FORM_ROUTE_NAME}
                position="right"
                withArrow
                arrowSize={4}
              >
                <ActionIcon
                  variant="transparent"
                  onClick={() => handleSetActiveTab(REGISTRATION_FORM_ROUTE)}
                >
                  <IconUserPlus
                    size={24}
                    stroke={1.5}
                    color={
                      activeTab === REGISTRATION_FORM_ROUTE
                        ? undefined
                        : 'black'
                    }
                  />
                </ActionIcon>
              </Tooltip>
              <Tooltip
                label={STUDENTS_ROUTE_NAME}
                position="right"
                withArrow
                arrowSize={4}
              >
                <ActionIcon
                  variant="transparent"
                  onClick={() => handleSetActiveTab(STUDENTS_ROUTE)}
                >
                  <IconTable
                    size={24}
                    stroke={1.5}
                    color={activeTab === STUDENTS_ROUTE ? undefined : 'black'}
                  />
                </ActionIcon>
              </Tooltip>
              {/** TODO: Add more tabs to the navbar here */}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
  // endregion
};

export default NavBar;
