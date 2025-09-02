import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@voltade/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@voltade/ui/dialog.tsx';
import { Label } from '@voltade/ui/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@voltade/ui/select.tsx';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { api } from '#src/lib/api.ts';
import { pgRest } from '#src/lib/pg-rest.ts';

interface CreateInvoiceFormValues {
  student_id: number | null;
  term_id: number | null;
}

export default function CreateInvoiceButton() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateInvoiceFormValues>({
    mode: 'onChange',
    defaultValues: { term_id: null, student_id: null },
  });

  const resetAndClose = useCallback(() => {
    form.reset();
    setOpen(false);
  }, [form]);

  const { data: studentsData } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('student_view')
        .select('id, name');
      if (error) {
        throw new Error(error.message);
      }
      return data as { id: number; name: string }[];
    },
  });

  const { data: termsData } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['terms'],
    queryFn: async () => {
      const { data, error } = await pgRest.from('term_view').select('id, name');
      if (error) {
        throw new Error(error.message);
      }
      return data as { id: number; name: string }[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (values: CreateInvoiceFormValues) => {
      if (values.term_id == null || values.student_id == null) {
        throw new Error('Missing required fields');
      }
      const res = await api['invoices'].$post({
        json: { term_id: values.term_id, student_id: values.student_id },
      });
      if (!res.ok) throw new Error('Invoice creation failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      resetAndClose();
    },
    onError: (error: Error) => {
      toast.error(`Invoice creation failed: ${error.message}`);
    },
  });

  const onSubmit = useCallback(
    (values: CreateInvoiceFormValues) => createInvoice.mutate(values),
    [createInvoice],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            The student's attendances for the selected term will be used to
            pre-fill the invoice with line items.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 py-4"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">
              Term
            </Label>
            <Controller
              name="term_id"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value != null ? String(field.value) : undefined}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger id="term" className="col-span-3">
                    <SelectValue placeholder="Select a term" />
                  </SelectTrigger>
                  <SelectContent>
                    {termsData?.map((term) => (
                      <SelectItem key={term.id} value={String(term.id)}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student" className="text-right">
              Student
            </Label>
            <Controller
              name="student_id"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value != null ? String(field.value) : undefined}
                  onValueChange={(val) => field.onChange(Number(val))}
                >
                  <SelectTrigger id="student" className="col-span-3">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentsData?.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !form.formState.isValid || createInvoice.status === 'pending'
              }
            >
              {createInvoice.status === 'pending' ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
