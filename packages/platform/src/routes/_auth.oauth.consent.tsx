import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBuilding,
  IconMail,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_auth/oauth/consent')({
  component: RouteComponent,
  beforeLoad: async () => {
    // Check if user is authenticated
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: '/signin',
        search: {
          redirect: window.location.href,
        },
      });
    }
  },
});

interface ConsentRequest {
  client_id: string;
  client_name?: string;
  client_uri?: string;
  logo_uri?: string;
  scopes: string[];
  redirect_uri: string;
  state?: string;
  challenge?: string;
}

interface ScopeInfo {
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  required?: boolean;
}

const SCOPE_DEFINITIONS: Record<string, ScopeInfo> = {
  openid: {
    name: 'Identity',
    description: 'Access your basic identity information',
    icon: IconUser,
    required: true,
  },
  profile: {
    name: 'Profile Information',
    description: 'Access your profile information such as name and picture',
    icon: IconUser,
  },
  email: {
    name: 'Email Address',
    description: 'Access your email address',
    icon: IconMail,
  },
  offline_access: {
    name: 'Offline Access',
    description:
      "Maintain access when you're not actively using the application",
    icon: IconShieldCheck,
  },
  organization: {
    name: 'Organization Access',
    description: 'Access your organization information and membership',
    icon: IconBuilding,
  },
};

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentRequest, setConsentRequest] = useState<ConsentRequest | null>(
    null,
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const loadConsentRequest = async () => {
      try {
        // Parse consent request from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('client_id');
        const scopes = urlParams.get('scope')?.split(' ') || [];
        const redirectUri = urlParams.get('redirect_uri');
        const state = urlParams.get('state');
        const challenge =
          urlParams.get('consent_challenge') || urlParams.get('challenge');

        if (!clientId) {
          setError('Missing client_id parameter');
          setIsLoading(false);
          return;
        }

        // In a real implementation, you would fetch client information from the backend
        // For now, use the provided parameters to construct the request
        const request: ConsentRequest = {
          client_id: clientId,
          client_name:
            urlParams.get('client_name') || `Application ${clientId}`,
          scopes,
          redirect_uri: redirectUri || '',
          state: state || undefined,
          challenge: challenge || undefined,
        };

        setConsentRequest(request);

        // Auto-select required scopes
        const requiredScopes = scopes.filter(
          (scope) => SCOPE_DEFINITIONS[scope]?.required,
        );
        setSelectedScopes(requiredScopes);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load consent request:', err);
        setError('Failed to load consent request');
        setIsLoading(false);
      }
    };

    loadConsentRequest();
  }, []);

  const handleScopeToggle = (scope: string) => {
    const scopeInfo = SCOPE_DEFINITIONS[scope];
    if (scopeInfo?.required) return; // Can't toggle required scopes

    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleApprove = async () => {
    if (!consentRequest) return;

    setIsSubmitting(true);
    try {
      const response = await authClient.oauth2.consent({
        accept: true,
      });

      window.location.href = response.data?.redirectURI ?? '/';
    } catch (err) {
      console.error('Failed to process consent:', err);
      setError('Failed to process consent. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleDeny = () => {
    if (!consentRequest) return;

    const params = new URLSearchParams({
      error: 'access_denied',
      error_description: 'User denied the consent request',
      ...(consentRequest.state && { state: consentRequest.state }),
    });

    if (consentRequest.redirect_uri) {
      window.location.href = `${consentRequest.redirect_uri}?${params.toString()}`;
    } else {
      // If no redirect URI, go back to the application
      const returnUrl =
        new URLSearchParams(window.location.search).get('return_to') || '/';
      window.location.href = returnUrl;
    }
  };

  if (isLoading) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading consent request...</Text>
        </Stack>
      </Container>
    );
  }

  if (error || !consentRequest) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" icon={<IconAlertTriangle size={16} />} title="Error">
          {error || 'Invalid consent request'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Stack align="center" gap="md">
          <div
            className="h-12 w-auto"
            style={{
              backgroundImage: 'url(https://voltade.com/images/Logo+typo.svg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
          <Title
            order={1}
            ta="center"
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Authorize Application
          </Title>
        </Stack>

        {/* Main consent card */}
        <Paper p="xl" withBorder radius="md" shadow="sm">
          <Stack gap="lg">
            {/* Application info */}
            <Stack gap="sm">
              <Group align="center" gap="md">
                <Avatar size="lg" color="blue">
                  {consentRequest.client_name?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Stack gap={4}>
                  <Text fw={600} size="lg">
                    {consentRequest.client_name || consentRequest.client_id}
                  </Text>
                  <Text size="sm" c="dimmed">
                    wants to access your Voltade OS account
                  </Text>
                </Stack>
              </Group>
            </Stack>

            {/* User info */}
            {session?.user && (
              <Card withBorder radius="sm" p="md" bg="gray.0">
                <Group gap="sm">
                  <Avatar src={session.user.image} size="sm">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      Signed in as {session.user.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {session.user.email}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}

            {/* Permissions */}
            <Stack gap="md">
              <Text fw={600} size="md">
                This application would like to:
              </Text>

              <Stack gap="xs">
                {consentRequest.scopes.map((scope) => {
                  const scopeInfo = SCOPE_DEFINITIONS[scope];
                  if (!scopeInfo) return null;

                  const IconComponent = scopeInfo.icon;
                  const isSelected = selectedScopes.includes(scope);
                  const isRequired = scopeInfo.required;

                  return (
                    <Card
                      key={scope}
                      withBorder={isSelected}
                      p="sm"
                      radius="sm"
                    >
                      <Group gap="sm" wrap="nowrap">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleScopeToggle(scope)}
                          disabled={isRequired}
                          size="sm"
                        />
                        <IconComponent size={20} />
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text size="sm" fw={500}>
                              {scopeInfo.name}
                            </Text>
                            {isRequired && (
                              <Text size="xs" c="orange" fw={500}>
                                Required
                              </Text>
                            )}
                          </Group>
                          <Text size="xs" c="dimmed">
                            {scopeInfo.description}
                          </Text>
                        </Stack>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>

            {/* Security notice */}
            <Alert color="blue" variant="light" radius="sm">
              <Text size="sm">
                Only approve access for applications you trust. You can revoke
                access at any time in your account settings.
              </Text>
            </Alert>

            {/* Action buttons */}
            <Group grow>
              <Button
                variant="outline"
                color="gray"
                onClick={handleDeny}
                disabled={isSubmitting}
                size="md"
              >
                Deny
              </Button>
              <Button
                onClick={handleApprove}
                loading={isSubmitting}
                disabled={selectedScopes.length === 0}
                size="md"
                style={{
                  backgroundColor: '#7c3aed',
                  borderColor: '#7c3aed',
                }}
              >
                Allow Access
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Footer */}
        <Text ta="center" size="xs" c="dimmed">
          By clicking "Allow Access", you agree to share the selected
          information with this application.
        </Text>
      </Stack>
    </Container>
  );
}
