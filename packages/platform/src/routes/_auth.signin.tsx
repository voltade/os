import { Paper } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { EmailForm } from '#src/components/auth/email-form.tsx';
import { EmailOtp } from '#src/components/auth/email-otp.tsx';

export const Route = createFileRoute('/_auth/signin')({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState('');

  return (
    <Paper withBorder shadow="sm" p="md" radius="md">
      {!email ? (
        <EmailForm onEmailSent={setEmail} />
      ) : (
        <EmailOtp email={email} />
      )}
    </Paper>
  );
}
