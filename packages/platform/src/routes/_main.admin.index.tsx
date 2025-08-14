import { createFileRoute } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent } from '@voltade/ui/card.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { Label } from '@voltade/ui/label.tsx';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { AccessDenied } from '#src/components/utils/access-denied';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { api } from '#src/lib/api.ts';
import { authClient } from '#src/lib/auth';

interface OrganizationFormValues {
  name: string;
  image: string;
}

export const Route = createFileRoute('/_main/admin/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OrganizationFormValues>({
    defaultValues: { name: '', image: '' },
  });

  // Get current user's role in the organization
  const currentUserMember = activeOrganization?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const currentUserRole = currentUserMember?.role;

  useEffect(() => {
    if (activeOrganization) {
      form.reset({
        name: activeOrganization.name || '',
        image: activeOrganization.logo || '',
      });
    }
  }, [activeOrganization, form]);

  // Both admins and owners can access general settings
  if (currentUserRole !== 'admin' && currentUserRole !== 'owner') {
    return <AccessDenied />;
  }

  const onSubmit = async (values: OrganizationFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.organization.$put({
        json: {
          organizationId: activeOrganization?.id || '',
          name: values.name,
          logo: values.image,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update organization');
      }

      showSuccess('Organization updated successfully');
    } catch (error) {
      showError(
        `Failed to update organization: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeOrganization) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and preferences
        </p>
      </div>

      <div className="space-y-4 w-full">
        <Card className="w-full gap-0">
          <CardContent className="w-full p-6">
            <div className="mb-4 flex items-center gap-3">
              <Avatar className="size-30 rounded-md">
                {activeOrganization.logo ? (
                  <AvatarImage
                    src={activeOrganization.logo}
                    alt={activeOrganization.name ?? 'Organization'}
                  />
                ) : null}
                <AvatarFallback className="rounded-md">
                  {(activeOrganization.name ?? 'O').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium">
                  {activeOrganization.name}
                </div>
                <div className="truncate text-sm text-muted-foreground">
                  {activeOrganization.slug}
                </div>
              </div>
            </div>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  className="w-full"
                  placeholder="Enter organization name"
                  {...form.register('name', { required: true, minLength: 2 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Organization Logo URL</Label>
                <Input
                  id="image"
                  className="w-full"
                  placeholder="Enter logo URL (optional)"
                  {...form.register('image')}
                />
                <p className="text-xs text-muted-foreground">
                  Provide a URL to your organization logo
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
