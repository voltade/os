import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import { Trash2 } from 'lucide-react';

interface RemoveMemberModalProps {
  opened: boolean;
  onClose: () => void;
  memberName?: string | null;
  isRemoving: boolean;
  onConfirm: () => void;
}

export function RemoveMemberModal({
  opened,
  onClose,
  memberName,
  isRemoving,
  onConfirm,
}: RemoveMemberModalProps) {
  return (
    <Dialog open={opened} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove <strong>{memberName}</strong> from
            this organization? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRemoving}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isRemoving}
            variant="destructive"
          >
            <Trash2 className="mr-1" size={16} /> Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
