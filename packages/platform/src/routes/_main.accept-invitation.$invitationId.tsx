import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import { useEffect, useState } from 'react';

import { Logo } from '#src/components/ui/logo.tsx';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/accept-invitation/$invitationId')({
  component: RouteComponent,
});

export default function RouteComponent() {
  const { invitationId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitationValid, setInvitationValid] = useState(false);

  useEffect(() => {
    const validateInvitation = async () => {
      try {
        const result = await authClient.organization.getInvitation({
          query: { id: invitationId },
        });
        if (result?.data) {
          setInvitationValid(true);
          setError(null);
        } else {
          setError('Invitation not found');
          setInvitationValid(false);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Invalid or expired invitation';
        setError(message);
        setInvitationValid(false);
      } finally {
        setValidating(false);
      }
    };
    validateInvitation();
  }, [invitationId]);

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await authClient.organization.acceptInvitation({ invitationId });
      navigate({ to: '/' });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to accept invitation';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex flex-1 flex-col justify-between px-6 lg:px-8">
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
        <div className="flex flex-1 items-center justify-center border-l border-border bg-background">
          <div className="w-full max-w-sm p-6 text-center">
            <p className="text-muted-foreground">Validating invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invitationValid) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex flex-1 flex-col justify-between px-6 lg:px-8">
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
        <div className="flex flex-1 items-center justify-center border-l border-border bg-background">
          <div className="w-full max-w-sm p-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Invalid or expired invitation
            </h2>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button onClick={() => navigate({ to: '/' })}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
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
      <div className="flex flex-1 items-center justify-center border-l border-border bg-background">
        <div className="w-full max-w-sm p-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Join organization
          </h2>
          <p className="mb-2 text-muted-foreground">
            You've been invited to join an organization.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            By accepting, you'll be added as a member and gain access
            immediately.
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Accepting…' : 'Accept invitation'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
