import { Button, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import { authClient } from '#src/lib/auth.ts';

interface Props {
  onEmailSent: (email: string) => void;
}

export function EmailForm({ onEmailSent }: Props) {
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
        await authClient.emailOtp.sendVerificationOtp({
          email: values.email,
          type: 'sign-in',
        });
        onEmailSent(values.email);
      })}
    >
      <Stack>
        <TextInput
          label="Email"
          className="min-w-sm"
          placeholder="you@company.com"
          required
          {...form.getInputProps('email')}
        />
        <Button type="submit">Sign in</Button>
      </Stack>
    </form>
  );
}
