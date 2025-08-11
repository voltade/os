import {
  ActionIcon,
  Box,
  Grid,
  Popover,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconGridDots } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { ENVIRONMENT_ID } from '#src/main.tsx';

// const apps = [
//   {
//     id: 'accounting',
//     name: 'Accounting',
//     icon: IconCoin,
//     color: '#4285f4',
//   },
//   {
//     id: 'hr',
//     name: 'HR',
//     icon: IconUsers,
//     color: '#ea4335',
//   },
//   {
//     id: 'purchase',
//     name: 'Purchase',
//     icon: IconShoppingCart,
//     color: '#34a853',
//   },
//   {
//     id: 'sales',
//     name: 'Sales',
//     icon: IconSales,
//     color: '#fbbc04',
//   },
//   {
//     id: 'service',
//     name: 'Service',
//     icon: IconTool,
//     color: '#9aa0a6',
//   },
//   {
//     id: 'inventory',
//     name: 'Inventory',
//     icon: IconPackage,
//     color: '#f439a0',
//   },
//   {
//     id: 'education',
//     name: 'Education',
//     icon: IconBook,
//     color: '#ab47bc',
//   },
//   {
//     id: 'hr2',
//     name: 'HR',
//     icon: IconUsers,
//     color: '#00acc1',
//   },
//   {
//     id: 'settings',
//     name: 'Settings',
//     icon: IconSettings,
//     color: '#ff7043',
//   },
// ];

export function AppSelector() {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);
  const { data: appInstallations } = useAppInstallations(ENVIRONMENT_ID);

  const handleAppClick = (appId: string) => {
    console.log(`Clicked app: ${appId}`);
    setOpened(false);
    navigate({
      to: '/$appId',
      params: {
        appId,
      },
    });
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      withArrow={false}
      shadow="lg"
      radius="md"
      offset={8}
    >
      <Popover.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          radius="md"
          onClick={() => setOpened(!opened)}
        >
          <IconGridDots size={20} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown p="md" w={280}>
        <Grid gutter="xs">
          {appInstallations?.map((app) => {
            // const Icon = app.icon;
            return (
              <Grid.Col span={4} key={app.app.id}>
                <UnstyledButton
                  onClick={() => handleAppClick(app.app.id)}
                  p="md"
                  style={{
                    borderRadius: '8px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#4285f4',
                    }}
                  >
                    <Text
                      size="md"
                      color="white"
                      fw="bold"
                      style={{ textTransform: 'uppercase' }}
                    >
                      {app.app.name?.charAt(0) ?? 'A'}
                    </Text>
                  </Box>
                  <Text
                    size="xs"
                    c="dimmed"
                    ta="center"
                    style={{ lineHeight: 1.2 }}
                  >
                    {app.app.name}
                  </Text>
                </UnstyledButton>
              </Grid.Col>
            );
          })}
        </Grid>
      </Popover.Dropdown>
    </Popover>
  );
}
