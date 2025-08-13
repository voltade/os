import {
  IconAlertTriangle,
  IconBuilding,
  IconMail,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent } from '@voltade/ui/card.tsx';
import { Checkbox } from '@voltade/ui/checkbox.tsx';
import type React from 'react';
import { useEffect, useState } from 'react';

import { Logo } from '#src/components/ui/logo.tsx';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_auth/oauth/consent')({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({
        to: '/signin',
        search: { redirect: window.location.href },
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
  icon: (props: { size?: number }) => React.ReactNode;
  required?: boolean;
}

const SCOPE_DEFINITIONS: Record<string, ScopeInfo> = {
  openid: {
    name: 'Identity',
    description: 'Access your basic identity information',
    icon: (p) => <IconUser size={p.size ?? 20} />,
    required: true,
  },
  profile: {
    name: 'Profile Information',
    description: 'Access your profile information such as name and picture',
    icon: (p) => <IconUser size={p.size ?? 20} />,
  },
  email: {
    name: 'Email Address',
    description: 'Access your email address',
    icon: (p) => <IconMail size={p.size ?? 20} />,
  },
  offline_access: {
    name: 'Offline Access',
    description:
      "Maintain access when you're not actively using the application",
    icon: (p) => <IconShieldCheck size={p.size ?? 20} />,
  },
  organization: {
    name: 'Organization Access',
    description: 'Access your organization information and membership',
    icon: (p) => <IconBuilding size={p.size ?? 20} />,
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
        const requiredScopes = scopes.filter(
          (s) => SCOPE_DEFINITIONS[s]?.required,
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
    if (scopeInfo?.required) return;
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleApprove = async () => {
    if (!consentRequest) return;
    setIsSubmitting(true);
    try {
      const response = await authClient.oauth2.consent({ accept: true });
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
      const returnUrl =
        new URLSearchParams(window.location.search).get('return_to') || '/';
      window.location.href = returnUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading consent request...
          </p>
        </div>
      </div>
    );
  }

  if (error || !consentRequest) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive-foreground">
          <IconAlertTriangle size={16} />
          <span>{error || 'Invalid consent request'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo />
        <h1 className="text-3xl font-bold text-foreground">
          Authorize Application
        </h1>
      </div>

      <Card>
        <CardContent className="space-y-5 p-4 sm:p-6">
          {/* Application info */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-bold uppercase">
                {consentRequest.client_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold">
                {consentRequest.client_name || consentRequest.client_id}
              </p>
              <p className="text-sm text-muted-foreground">
                wants to access your Voltade OS account
              </p>
            </div>
          </div>

          {/* User info */}
          {session?.user && (
            <div className="rounded-md border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  {session.user.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name ?? 'User'}
                    />
                  ) : (
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    Signed in as {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              This application would like to:
            </p>
            <div className="space-y-2">
              {consentRequest.scopes.map((scope) => {
                const scopeInfo = SCOPE_DEFINITIONS[scope];
                if (!scopeInfo) return null;
                const isSelected = selectedScopes.includes(scope);
                const isRequired = scopeInfo.required;
                const IconComp = scopeInfo.icon;
                return (
                  <div key={scope} className="rounded-md border p-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleScopeToggle(scope)}
                        disabled={isRequired}
                      />
                      <IconComp size={20} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            {scopeInfo.name}
                          </p>
                          {isRequired && (
                            <span className="text-xs font-medium text-amber-600">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {scopeInfo.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-600">
            <IconAlertTriangle size={16} />
            <span>
              Only approve access for applications you trust. You can revoke
              access at any time in your account settings.
            </span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={isSubmitting}
            >
              Deny
            </Button>
            <Button
              onClick={handleApprove}
              disabled={selectedScopes.length === 0 || isSubmitting}
            >
              Allow Access
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By clicking "Allow Access", you agree to share the selected information
        with this application.
      </p>
    </div>
  );
}
