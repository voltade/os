import { useNavigate } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@voltade/ui/input-otp.tsx';
import { useMemo, useState } from 'react';

import { showError } from '#src/components/utils/notifications.tsx';
import { authClient } from '#src/lib/auth.ts';

interface Props {
  email: string;
  setEmail: (email: string | null) => void;
}

export function EmailOtp({ email, setEmail }: Props) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const slots = useMemo(() => ['s1', 's2', 's3', 's4', 's5', 's6'], []);

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      showError('Enter the 6-digit code');
      return;
    }
    setIsLoading(true);
    try {
      const result = await authClient.signIn.emailOtp({ email, otp });
      if (!result.error) {
        const session = await authClient.getSession();
        const needsOnboarding =
          !session.data?.user?.name ||
          session.data.user.name.trim().length === 0;
        navigate({ to: needsOnboarding ? '/onboarding' : '/' });
      } else {
        showError(result.error.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="flex justify-center">
        <InputOTP
          value={otp}
          onChange={(v) => setOtp(v)}
          maxLength={6}
          containerClassName="justify-center"
        >
          <InputOTPGroup>
            {slots.map((key, i) => (
              <InputOTPSlot key={key} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Verifying…' : 'Verify and Sign in'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setEmail(null)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
