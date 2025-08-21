import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@voltade/ui/table.tsx';
import { useMemo } from 'react';

import { pgRest } from '#src/lib/pg-rest.ts';

type StudentRow = {
  id: number | null;
  name: string | null;
  phone: string | null;
  school: string | null;
  email: string | null;
  class_ids: number[] | null;
};

export default function StudentsTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('student_view')
        .select('id, name, phone, school, email, class_ids')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      return data as StudentRow[];
    },
  });

  const rows = useMemo(() => {
    return (data ?? []).map((s) => (
      <TableRow key={s.id ?? Math.random()}>
        <TableCell>{s.id ?? '-'}</TableCell>
        <TableCell>{s.name ?? '-'}</TableCell>
        <TableCell>{s.school ?? '-'}</TableCell>
        <TableCell>{s.phone ?? '-'}</TableCell>
        <TableCell>{s.email ?? '-'}</TableCell>
        <TableCell>
          {Array.isArray(s.class_ids) && s.class_ids.length > 0
            ? s.class_ids.join(', ')
            : '-'}
        </TableCell>
      </TableRow>
    ));
  }, [data]);

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Students</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>School</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Class IDs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
    </div>
  );
}
