import { Button, Stack, Text, Title } from '@mantine/core';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

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

  // Validate invitation on component mount by trying to get invitation details
  useEffect(() => {
    const validateInvitation = async () => {
      try {
        // Try to get invitation details to validate it exists and is valid
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
      await authClient.organization.acceptInvitation({
        invitationId,
      });

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
      <Stack justify="center" align="center" h="100vh" className="bg-gray-50">
        <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-sm">
          <Text className="text-gray-600 mb-4">Validating invitation...</Text>
        </div>
      </Stack>
    );
  }

  if (error || !invitationValid) {
    return (
      <Stack justify="center" align="center" h="100vh" className="bg-gray-50">
        <div className="max-w-md text-center p-8 bg-white rounded-lg shadow-sm">
          <Title order={2} className="text-2xl font-bold text-gray-900 mb-4">
            Invalid or expired invitation
          </Title>
          <Text className="text-gray-600 mb-6">{error}</Text>
          <Button onClick={() => navigate({ to: '/' })}>Go to Dashboard</Button>
        </div>
      </Stack>
    );
  }

  return (
    <Stack justify="center" align="center" h="100vh" className="bg-gray-50">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-sm">
        <Title order={2} className="text-2xl font-bold text-gray-900 mb-4">
          Join organization
        </Title>
        <Text className="text-gray-600 mb-2">
          You've been invited to join an organization.
        </Text>
        <Text className="text-gray-500 mb-6" size="sm">
          By accepting, you'll be added as a member and gain access immediately.
        </Text>

        <Stack gap="md">
          <Button
            onClick={handleAccept}
            loading={loading}
            size="md"
            className="w-full"
          >
            Accept invitation
          </Button>

          <Button
            variant="light"
            onClick={() => navigate({ to: '/' })}
            className="w-full"
          >
            Cancel
          </Button>
        </Stack>
      </div>
    </Stack>
  );
}
