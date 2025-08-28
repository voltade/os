import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@voltade/ui/dialog.tsx';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import ClassesTable from '#src/components/ClassesTable.tsx';
import CreateClassForm from '#src/components/CreateClassForm.tsx';

export const Route = createFileRoute('/')({
  component: Component,
});

function Component() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <ClassesTable
        headerAction={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add Class
          </Button>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Class</DialogTitle>
          </DialogHeader>
          <CreateClassForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
