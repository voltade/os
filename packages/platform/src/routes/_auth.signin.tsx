import { Group, Stack, Text, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { EmailForm } from '#src/components/auth/email-form.tsx';
import { EmailOtp } from '#src/components/auth/email-otp.tsx';

export const Route = createFileRoute('/_auth/signin')({
  component: RouteComponent,
});

export default function RouteComponent() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <Group className="min-h-screen bg-white" wrap="nowrap" gap={0}>
      {/* Left side - Voltade OS title and tagline */}
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

      {/* Right side - Sign in form */}
      <Stack
        className="flex-1 bg-gray-50"
        justify="center"
        align="center"
        h="100vh"
      >
        <div className="max-w-sm w-full">
          {!email ? (
            <EmailForm onEmailSent={setEmail} />
          ) : (
            <EmailOtp email={email} setEmail={setEmail} />
          )}
        </div>
      </Stack>
    </Group>
  );
}
