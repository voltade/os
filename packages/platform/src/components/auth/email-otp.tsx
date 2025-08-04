import { Button, PinInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@tanstack/react-router';

import { authClient } from '#src/lib/auth.ts';

interface Props {
  email: string;
}

export function EmailOtp({ email }: Props) {
  const navigate = useNavigate();
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      otp: '',
    },
  });
  return (
    <form
      onSubmit={form.onSubmit(async (values) => {
        try {
          const { error } = await authClient.signIn.emailOtp({
            email,
            otp: values.otp,
          });
          if (error) {
            throw new Error(error.message);
          }
          navigate({ to: '/' }); // Use navigate hook for proper routing
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: (error as Error).message,
            color: 'red',
          });
        }
      })}
    >
      <Stack>
        <PinInput
          autoFocus
          className="flex-1"
          length={6}
          {...form.getInputProps('otp')}
        />
        <Button type="submit">Confirm</Button>
      </Stack>
    </form>
  );
}
