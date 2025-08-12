import { Button } from '@voltade/ui/button.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { useState } from 'react';

import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { authClient } from '#src/lib/auth.ts';

interface Props {
  onEmailSent: (email: string) => void;
}

export function EmailForm({ onEmailSent }: Props) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!/^\S+@\S+$/.test(email)) {
      showError('Please enter a valid email');
      return;
    }
    setIsLoading(true);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (result.error) {
        showError(result.error.message || 'Failed to send verification code');
        return;
      }
      showSuccess('Check your email for a verification code');
      onEmailSent(email);
    } catch (e) {
      showError(
        e instanceof Error ? e.message : 'Failed to send verification code',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <div>
        <label
          htmlFor="signin-email"
          className="mb-1 block text-sm font-medium text-muted-foreground"
        >
          E-mail
        </label>
        <div className="relative">
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@voltade.com"
            autoComplete="email"
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending…' : 'Send verification code'}
      </Button>
    </form>
  );
}
