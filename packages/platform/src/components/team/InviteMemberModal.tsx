import { IconPlus } from '@tabler/icons-react';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import { Input } from '@voltade/ui/input.tsx';
import { Label } from '@voltade/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { Separator } from '@voltade/ui/separator.tsx';
import { useForm } from 'react-hook-form';

interface InviteFormValues {
  email: string;
  role: string;
}

interface InviteMemberModalProps {
  opened: boolean;
  onClose: () => void;
  roleOptions: { value: string; label: string }[];
  isInviting: boolean;
  onSubmit: (values: InviteFormValues) => void | Promise<void>;
}

export function InviteMemberModal({
  opened,
  onClose,
  roleOptions,
  isInviting,
  onSubmit,
}: InviteMemberModalProps) {
  const form = useForm<InviteFormValues>({
    defaultValues: {
      email: '',
      role: roleOptions[0]?.value ?? 'member',
    },
  });

  return (
    <Dialog open={opened} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogDescription>
            We’ll email an invitation to this person. They’ll be able to join
            your organization with the selected role.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (vals) => {
            await onSubmit(vals);
          })}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="Enter member's email"
              required
              {...form.register('email', { required: true })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={form.getValues('role')}
              onValueChange={(val) =>
                form.setValue('role', val, { shouldDirty: true })
              }
            >
              <SelectTrigger id="invite-role">
                <SelectValue placeholder="Select member role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting}>
              <IconPlus className="mr-1" size={16} /> Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
