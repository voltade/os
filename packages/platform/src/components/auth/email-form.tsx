import { Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

import { authClient } from '#src/lib/auth.ts';

interface Props {
  onEmailSent: (email: string) => void;
}

export function EmailForm({ onEmailSent }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        setIsLoading(true);
        try {
          const result = await authClient.emailOtp.sendVerificationOtp({
            email: values.email,
            type: 'sign-in',
          });
          if (!result.error) {
            onEmailSent(values.email);
          } else {
            notifications.show({
              title: 'Error',
              message:
                result.error.message || 'Failed to send verification code',
              color: 'red',
            });
          }
        } catch (error) {
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
            Sign in
          </Title>
        </Stack>

        <Stack gap="lg">
          <Stack gap="xs">
            <Text className="text-sm font-medium text-gray-700">E-mail</Text>
            <TextInput
              placeholder="john@voltade.com"
              type="email"
              autoComplete="email"
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
              {...form.getInputProps('email')}
            />
          </Stack>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
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
            {isLoading ? 'Sending...' : 'Send verification code'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
