import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { useEffect, useState } from 'react';

import { Logo } from '#src/components/ui/logo.tsx';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_auth/onboarding')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await authClient.getSession();
      if (error || !data) {
        redirect({ to: '/signin' });
        return;
      }
    })();
  }, []);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showError('Name must be at least 2 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.updateUser({ name: trimmed });
      if (result.error) {
        showError(result.error.message || 'Failed to save name');
        return;
      }
      showSuccess('Welcome to Voltade');
      navigate({ to: '/' });
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to save name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: branding */}
      <div className="flex flex-1 flex-col justify-between px-8 lg:px-16">
        <div className="pt-8">
          <Logo />
        </div>
        <div className="flex flex-1 items-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold leading-tight text-foreground">
              Voltade OS
            </h1>
            <p className="mt-4 text-3xl leading-tight text-muted-foreground">
              Next gen business software and developer platform
            </p>
          </div>
        </div>
        <div />
      </div>

      {/* Right: onboarding form */}
      <div className="flex flex-1 items-center justify-center border-l">
        <div className="w-full max-w-sm p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground">
              Enter your name
            </h2>
            <p className="text-sm text-muted-foreground">
              We will use this to personalize your account.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="onboarding-fullname"
                className="mb-1 block text-sm font-medium text-muted-foreground"
              >
                Full name
              </label>
              <Input
                id="onboarding-fullname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving…' : 'Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
