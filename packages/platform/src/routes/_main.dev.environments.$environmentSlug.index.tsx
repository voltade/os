import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@voltade/ui/form.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AccessDenied } from '#src/components/utils/access-denied.tsx';
import {
  useDeleteEnvironment,
  useEnvironment,
} from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const { data, isLoading } = useEnvironment(environmentSlug);
  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();

  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  if (!isAllowed) return <AccessDenied />;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {data.name}
        </h3>
        <p className="text-sm text-muted-foreground">{data.slug}</p>
      </div>

      <DeleteEnvironmentButton
        environmentSlug={data.slug}
        onDeleted={() => navigate({ to: '/dev/environments' })}
        disabled={!isAllowed}
      />
    </div>
  );
}

const confirmSchema = z.object({
  confirm: z.string().min(1),
});

function DeleteEnvironmentButton({
  environmentSlug,
  disabled,
  onDeleted,
}: {
  environmentSlug: string;
  disabled?: boolean;
  onDeleted: () => void;
}) {
  const form = useForm<z.input<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { confirm: '' },
    mode: 'onChange',
  });
  const [open, setOpen] = useState(false);
  const deleteEnv = useDeleteEnvironment();

  const onSubmit = async (values: z.input<typeof confirmSchema>) => {
    if (values.confirm !== environmentSlug) return;
    await deleteEnv.mutateAsync(environmentSlug);
    setOpen(false);
    onDeleted();
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Delete environment
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete environment</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Type the environment slug
              <span className="mx-1 rounded bg-muted px-1 font-mono text-foreground">
                {environmentSlug}
              </span>
              to confirm.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-2" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder={environmentSlug} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={deleteEnv.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={form.handleSubmit(onSubmit)}
              disabled={
                !form.watch('confirm') ||
                form.watch('confirm') !== environmentSlug ||
                deleteEnv.isPending
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
