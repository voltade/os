import { Button, PinInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { authClient } from '#src/lib/auth.ts';

interface Props {
  email: string;
  setEmail: (email: string | null) => void;
}

export function EmailOtp({ email, setEmail }: Props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      otp: '',
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        setIsLoading(true);
        try {
          const result = await authClient.signIn.emailOtp({
            email,
            otp: values.otp,
          });
          if (!result.error) {
            // After successful sign-in, check if onboarding is needed
            const session = await authClient.getSession();
            const needsOnboarding =
              !session.data?.user?.name ||
              session.data.user.name.trim().length === 0;
            navigate({ to: needsOnboarding ? '/onboarding' : '/' });
          } else {
            notifications.show({
              title: 'Error',
              message: result.error.message || 'Invalid verification code',
              color: 'red',
            });
          }
        } catch (error) {
          console.error('Error verifying OTP:', error);
          notifications.show({
            title: 'Error',
            message: (error as Error).message,
            color: 'red',
          });
        } finally {
          setIsLoading(false);
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
            Enter verification code
          </Title>
          <Text className="text-sm text-gray-600">
            We sent a code to {email}
          </Text>
        </Stack>

        <Stack gap="lg">
          <Stack gap="xs">
            <PinInput
              length={6}
              size="lg"
              autoFocus
              styles={{
                input: {
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 600,
                  width: '48px',
                  height: '48px',
                },
              }}
              {...form.getInputProps('otp')}
            />
          </Stack>

          <Button type="submit" fullWidth size="md" loading={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify and Sign in'}
          </Button>
          <Button
            onClick={() => {
              setEmail(null);
            }}
            size="md"
            variant="outline"
          >
            Cancel
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
