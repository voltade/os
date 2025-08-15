import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@voltade/ui/form.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { Textarea } from '@voltade/ui/textarea.tsx';
import { Package, Save, Undo2, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { createAppSchema, updateAppSchema } from '#shared/schemas/app.ts';
import { Loading } from '#src/components/utils/loading.tsx';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { useApps, useCreateApp, useUpdateApp } from '#src/hooks/app.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/applications')({
  component: RouteComponent,
});

type AppItem = {
  id: string;
  slug: string;
  name: string | null;
  description: string | null;
  build_command: string;
  output_path: string;
  entrypoint: string;
  git_repo_url: string;
  git_repo_branch: string;
  git_repo_path: string;
};

function RouteComponent() {
  const { data: organisation, isPending } = authClient.useActiveOrganization();
  const orgId = organisation?.id ?? '';
  const { data: apps, isLoading: isAppsLoading } = useApps(orgId, {
    enabled: !!orgId,
  });

  if (isPending) {
    return <Loading fullHeight message="Loading applications..." />;
  }

  if (isAppsLoading) {
    return (
      <div className="pt-8">
        <div className="w-full">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {Array.from({ length: 6 }, (_, index) => `skeleton-${index}`).map(
              (skeletonId) => (
                <div
                  key={skeletonId}
                  className="animate-pulse flex flex-col items-center text-center"
                >
                  <div className="size-16 flex items-center justify-center rounded-lg bg-card border shadow-sm mb-2">
                    <Package size={24} className="text-muted-foreground" />
                  </div>
                  <div className="h-3 bg-muted rounded w-8" />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    );
  }

  const list = (apps as AppItem[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Applications
        </h2>
        <CreateAppButton />
      </div>

      {list.length === 0 ? (
        <div className="text-center p-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No applications found
          </h3>
          <p className="text-sm text-muted-foreground">
            Build and publish apps to see them here.
          </p>
        </div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {list.map((app) => (
              <AppCard key={app.id} app={app} orgId={orgId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CreateAppButton() {
  const { data: organisation } = authClient.useActiveOrganization();
  const orgId = organisation?.id ?? '';
  const createApp = useCreateApp(orgId);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createAppSchema>>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      slug: '',
      name: '',
      description: '',
      build_command: 'bun run build',
      output_path: 'dist',
      entrypoint: 'dist/index.js',
      git_repo_url: '',
      git_repo_branch: 'main',
      git_repo_path: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: z.infer<typeof createAppSchema>) => {
    try {
      const payload = {
        ...values,
        name: values.name?.trim() === '' ? null : values.name,
        description:
          values.description?.trim() === '' ? null : values.description,
      };
      await createApp.mutateAsync(payload);
      showSuccess('App created');
      setOpen(false);
      form.reset();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to create app');
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Wrench size={16} className="mr-2" /> Add Application
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              className="grid grid-cols-1 gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="my-app" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="App name"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What does this app do?"
                        className="min-h-20"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="git_repo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Git Repository URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/org/repo.git"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="git_repo_branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="main" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="git_repo_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repo Path</FormLabel>
                      <FormControl>
                        <Input placeholder="apps/my-app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="build_command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build Command</FormLabel>
                      <FormControl>
                        <Input placeholder="bun run build" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="output_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output Path</FormLabel>
                      <FormControl>
                        <Input placeholder="dist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="entrypoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrypoint</FormLabel>
                      <FormControl>
                        <Input placeholder="dist/index.js" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createApp.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isDirty || createApp.isPending}
            >
              <Save size={16} className="mr-2" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AppCard({ app, orgId }: { app: AppItem; orgId: string }) {
  const updateApp = useUpdateApp(orgId);
  const [open, setOpen] = useState(false);

  const defaults = useMemo(
    () => ({
      id: app.id,
      slug: app.slug,
      name: app.name ?? '',
      description: app.description ?? '',
      build_command: app.build_command,
      output_path: app.output_path,
      entrypoint: app.entrypoint,
      git_repo_url: app.git_repo_url,
      git_repo_branch: app.git_repo_branch,
      git_repo_path: app.git_repo_path,
    }),
    [app],
  );

  const form = useForm<z.infer<typeof updateAppSchema>>({
    resolver: zodResolver(updateAppSchema),
    defaultValues: defaults,
    mode: 'onChange',
  });

  const onReset = () => form.reset(defaults);

  const onSubmit = async (values: z.infer<typeof updateAppSchema>) => {
    try {
      const payload = {
        ...values,
        name: values.name?.trim() === '' ? null : values.name,
        description:
          values.description?.trim() === '' ? null : values.description,
      };
      await updateApp.mutateAsync(payload);
      showSuccess('App updated');
      setOpen(false);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update app');
    }
  };

  return (
    <div className="rounded-lg border p-3 space-y-3 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-10 flex items-center justify-center rounded-md bg-card border">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {defaults.name || 'Unnamed App'}
            </div>
            <div className="text-xs text-muted-foreground">{defaults.slug}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            title="Edit"
            onClick={() => setOpen(true)}
          >
            <Wrench size={16} />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit App</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              className="grid grid-cols-1 gap-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="App name"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="my-app" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What does this app do?"
                        className="min-h-20"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="git_repo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Git Repository URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/org/repo.git"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="git_repo_branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="main" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="git_repo_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repo Path</FormLabel>
                      <FormControl>
                        <Input placeholder="apps/my-app" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="build_command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Build Command</FormLabel>
                      <FormControl>
                        <Input placeholder="bun run build" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="output_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output Path</FormLabel>
                      <FormControl>
                        <Input placeholder="dist" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="entrypoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrypoint</FormLabel>
                      <FormControl>
                        <Input placeholder="dist/index.js" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateApp.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isDirty || updateApp.isPending}
            >
              <Save size={16} className="mr-2" /> Save
            </Button>
            <Button
              variant="secondary"
              onClick={onReset}
              disabled={!form.formState.isDirty || updateApp.isPending}
            >
              <Undo2 size={16} className="mr-2" /> Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
