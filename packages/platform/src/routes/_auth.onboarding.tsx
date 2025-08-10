import { Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_auth/onboarding' as any)({
  component: RouteComponent,
  beforeLoad: async () => {
    // Require an authenticated session for onboarding
    const { data } = await authClient.getSession();
    if (!data) {
      throw redirect({ to: '/signin' });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
    },
  });

  return (
    <Group className="min-h-screen bg-white" wrap="nowrap" gap={0}>
      {/* Left side - Branding, identical to sign-in */}
      <Stack className="flex-1 px-8 lg:px-16" justify="space-between" h="100vh">
        <div className="pt-8">
          <div
            className="h-8 w-auto"
            style={{
              backgroundImage: 'url(https://voltade.com/images/Logo+typo.svg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left center',
            }}
          />
        </div>

        <div className="flex-1 flex items-center">
          <div className="max-w-md">
            <Stack gap="xl">
              <Title
                order={1}
                className="text-5xl font-bold text-gray-900 leading-tight"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                Voltade OS
              </Title>
              <Text className="text-3xl text-gray-900 leading-tight">
                Next gen business software and developer platform
              </Text>
            </Stack>
          </div>
        </div>

        <div></div>
      </Stack>

      {/* Right side - Onboarding name form */}
      <Stack
        className="flex-1 bg-gray-50"
        justify="center"
        align="center"
        h="100vh"
      >
        <div className="max-w-sm w-full">
          <form
            onSubmit={form.onSubmit(async (values) => {
              try {
                const result = await authClient.updateUser({
                  name: values.name.trim(),
                });
                if (result.error) {
                  notifications.show({
                    title: 'Error',
                    message: result.error.message || 'Failed to save name',
                    color: 'red',
                  });
                  return;
                }
                navigate({ to: '/' });
              } catch (error) {
                notifications.show({
                  title: 'Error',
                  message: (error as Error).message,
                  color: 'red',
                });
              }
            })}
          >
            <Stack gap="xl">
              <Stack gap="xs">
                <Title
                  order={2}
                  className="text-3xl font-bold text-gray-900"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  Enter your name
                </Title>
                <Text className="text-sm text-gray-600">
                  We will use this to personalize your account.
                </Text>
              </Stack>

              <Stack gap="lg">
                <Stack gap="xs">
                  <Text className="text-sm font-medium text-gray-700">
                    Full name
                  </Text>
                  <TextInput
                    placeholder="Jane Doe"
                    required
                    size="md"
                    styles={{
                      input: {
                        border: 'none',
                        borderBottom: '2px solid #e5e7eb',
                        borderRadius: '0',
                        backgroundColor: 'transparent',
                        padding: '12px 0',
                        fontSize: '16px',
                        '&:focus': {
                          outline: 'none',
                          borderBottom: '2px solid #7c3aed',
                          backgroundColor: 'transparent',
                        },
                      },
                    }}
                    key={form.key('name')}
                    {...form.getInputProps('name')}
                  />
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  style={{
                    backgroundColor: '#7c3aed',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '16px',
                    color: 'white',
                    height: '48px',
                  }}
                >
                  Continue
                </Button>
              </Stack>
            </Stack>
          </form>
        </div>
      </Stack>
    </Group>
  );
}
