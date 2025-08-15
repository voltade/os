import { zodResolver } from '@hookform/resolvers/zod';
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
import { Save, Undo2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { createAppSchema, updateAppSchema } from '#shared/schemas/app.ts';
import {
  showError,
  showSuccess,
} from '#src/components/utils/notifications.tsx';
import { useCreateApp, useUpdateApp } from '#src/hooks/app.ts';

type AppItem = {
  id?: string;
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

interface CreateAppFormProps {
  mode: 'create';
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface UpdateAppFormProps {
  mode: 'update';
  orgId: string;
  app: AppItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type AppFormProps = CreateAppFormProps | UpdateAppFormProps;

export function AppForm(props: AppFormProps) {
  const { mode, orgId, open, onOpenChange, onSuccess } = props;
  const createApp = useCreateApp(orgId);
  const updateApp = useUpdateApp(orgId);

  const isCreate = mode === 'create';
  const isUpdate = mode === 'update';
  const app = isUpdate ? props.app : null;

  const defaults = useMemo(() => {
    if (isCreate) {
      return {
        slug: '',
        name: '',
        description: '',
        build_command: 'bun run build',
        output_path: 'dist',
        entrypoint: 'dist/index.js',
        git_repo_url: '',
        git_repo_branch: 'main',
        git_repo_path: '',
      };
    }
    if (!app?.id) {
      throw new Error('App is required for update mode');
    }
    return {
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
    };
  }, [isCreate, app]);

  const schema = isCreate ? createAppSchema : updateAppSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: 'onChange',
  });

  // Reset form when defaults change (for update mode)
  useEffect(() => {
    form.reset(defaults);
  }, [form, defaults]);

  const onReset = () => form.reset(defaults);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const payload = {
        ...values,
        name: values.name?.trim() === '' ? null : values.name,
        description:
          values.description?.trim() === '' ? null : values.description,
      };

      if (isCreate) {
        await createApp.mutateAsync(payload as z.input<typeof createAppSchema>);
        showSuccess('App created');
        form.reset();
      } else {
        await updateApp.mutateAsync(payload as z.input<typeof updateAppSchema>);
        showSuccess('App updated');
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      showError(
        e instanceof Error
          ? e.message
          : `Failed to ${isCreate ? 'create' : 'update'} app`,
      );
    }
  };

  const isPending = isCreate ? createApp.isPending : updateApp.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? 'Create' : 'Edit'} Application</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid grid-cols-1 gap-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {isUpdate && (
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
            )}
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
            {isCreate && (
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
            )}
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
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!form.formState.isDirty || isPending}
          >
            <Save size={16} className="mr-2" /> {isCreate ? 'Create' : 'Save'}
          </Button>
          {isUpdate && (
            <Button
              variant="secondary"
              onClick={onReset}
              disabled={!form.formState.isDirty || isPending}
            >
              <Undo2 size={16} className="mr-2" /> Reset
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience components for easier usage
export function CreateAppForm(props: Omit<CreateAppFormProps, 'mode'>) {
  return <AppForm {...props} mode="create" />;
}

export function UpdateAppForm(props: Omit<UpdateAppFormProps, 'mode'>) {
  return <AppForm {...props} mode="update" />;
}
