import { useQuery } from '@tanstack/react-query';
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
import { useState } from 'react';

import { pgRest } from '#src/lib/pg-rest.ts';

export default function CreateInvoiceButton() {
  const [selectedTerm, setSelectedTerm] = useState<string | undefined>();
  const [selectedStudent, setSelectedStudent] = useState<string | undefined>();

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

  return (
    <Dialog>
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="term" className="text-right">
              Term
            </Label>
            <Select
              value={selectedTerm}
              onValueChange={(val) => setSelectedTerm(val)}
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
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="student" className="text-right">
              Student
            </Label>
            <Select
              value={selectedStudent}
              onValueChange={(val) => setSelectedStudent(val)}
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
          </div>
        </div>
        <DialogFooter>
          <Button type="button" disabled={!selectedTerm || !selectedStudent}>
            Create (TODO)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
