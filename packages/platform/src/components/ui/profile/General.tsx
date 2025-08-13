import { Avatar, AvatarFallback, AvatarImage } from '@voltade/ui/avatar.tsx';
import { Button } from '@voltade/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@voltade/ui/card.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { Label } from '@voltade/ui/label.tsx';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { authClient } from '#src/lib/auth';

interface ProfileFormValues {
  name: string;
  email: string;
  image: string;
}

export function ProfileGeneral() {
  const { data: sessionData } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: { name: '', email: '', image: '' },
  });

  useEffect(() => {
    if (sessionData?.user) {
      form.reset({
        name: sessionData.user.name || '',
        email: sessionData.user.email || '',
        image: sessionData.user.image || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionData?.user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.updateUser({
        name: values.name,
        image: values.image,
      });
      if (error) console.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!sessionData?.user) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 w-full">
      {' '}
      {/* ensure container is full width */}
      <Card className="w-full gap-0">
        {' '}
        {/* make card span full width */}
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full p-6">
          {' '}
          {/* give content the full width + comfy padding */}
          <div className="mb-4 flex items-center gap-3">
            <Avatar className="size-12 rounded-md">
              {sessionData.user.image ? (
                <AvatarImage
                  src={sessionData.user.image}
                  alt={sessionData.user.name ?? 'User'}
                />
              ) : null}
              <AvatarFallback className="rounded-md">
                {(sessionData.user.name ?? 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">
                {sessionData.user.name}
              </div>
              <div className="truncate text-sm text-muted-foreground">
                {sessionData.user.email}
              </div>
            </div>
          </div>
          {/* remove max-w-xl so inputs can use full card width */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className="w-full"
                placeholder="Enter your name"
                {...form.register('name', { minLength: 2 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input
                id="image"
                className="w-full"
                placeholder="Enter image URL (optional)"
                {...form.register('image')}
              />
              <p className="text-xs text-muted-foreground">
                Provide a URL to your profile image
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                className="w-full"
                disabled
                {...form.register('email')}
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your authentication provider and cannot be
                changed here.
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
  );
}
