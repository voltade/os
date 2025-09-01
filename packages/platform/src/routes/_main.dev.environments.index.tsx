import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
import { Switch } from '@voltade/ui/switch.tsx';
import { Database, Plus, Search, Server } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { createEnvironmentSchema } from '#shared/schemas/environment.ts';
import { AccessDenied } from '#src/components/utils/access-denied.tsx';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import {
  useCreateEnvironment,
  useEnvironments,
} from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/environments/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: environments, isLoading } = useEnvironments(
    organisation?.id ?? '',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  const filteredEnvironments = useMemo(() => {
    if (!environments) return [];
    if (!searchQuery.trim()) return environments;

    return environments.filter(
      (env) =>
        env.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        env.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        env.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [environments, searchQuery]);

  if (!isAllowed) return <AccessDenied />;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading environments...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        inor{' '}
        <h2 className="text-3xl font-bold text-foreground">Environments</h2>
        <CreateEnvironmentButton />
      </div>

      <div className="max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search environments..."
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm outline-none ring-0 focus:border-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </div>
      </div>

      {filteredEnvironments.length === 0 ? (
        <div className="rounded-lg border p-6 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted/50">
            <Server size={28} className="opacity-60" />
          </div>
          <p className="text-lg font-medium">
            {searchQuery ? 'No environments found' : 'No environments yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'Create your first environment to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEnvironments.map((environment) => (
            <div key={environment.id} className="rounded-lg border p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-lg font-semibold">
                        {environment.name || environment.slug}
                      </p>
                      {environment.is_production && (
                        <span className="inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Production
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {environment.slug}
                    </p>
                    {environment.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {environment.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Server size={14} className="opacity-70" />
                    <span>
                      {environment.runner_count} runner
                      {environment.runner_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Database size={14} className="opacity-70" />
                    <span>
                      {environment.database_instance_count} DB
                      {environment.database_instance_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-2 inline-flex w-full justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() =>
                    navigate({
                      to: '/dev/environments/$environmentSlug',
                      params: { environmentSlug: environment.slug },
                    })
                  }
                >
                  Manage Environment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateEnvironmentButton() {
  const { data: organisation } = authClient.useActiveOrganization();
  const orgId = organisation?.id ?? '';
  const createEnv = useCreateEnvironment(orgId);
  const [open, setOpen] = useState(false);

  const form = useForm<z.input<typeof createEnvironmentSchema>>({
    resolver: zodResolver(createEnvironmentSchema),
    defaultValues: {
      slug: '',
      name: '',
      description: '',
      is_production: false,
      runner_count: 1,
      database_instance_count: 1,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: z.input<typeof createEnvironmentSchema>) => {
    try {
      const payload = {
        ...values,
        name: values.name?.trim() === '' ? null : values.name,
        description:
          values.description?.trim() === '' ? null : values.description,
      };
      const parsed = createEnvironmentSchema.parse(payload);
      await createEnv.mutateAsync(parsed);
      showSuccess('Environment created');
      setOpen(false);
      form.reset();
    } catch (e) {
      showError(
        e instanceof Error ? e.message : 'Failed to create environment',
      );
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} className="mr-2" /> Add New Environment
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Environment</DialogTitle>
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
                      <Input placeholder="staging" {...field} />
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
                        placeholder="Environment name"
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
                      <Input
                        placeholder="Optional description"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="is_production"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production</FormLabel>
                      <FormControl>
                        <div className="h-9 flex items-center">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="runner_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Runners</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={Number(field.value ?? 0)}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="database_instance_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DB Instances</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          value={Number(field.value ?? 0)}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
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
              disabled={createEnv.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isDirty || createEnv.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
