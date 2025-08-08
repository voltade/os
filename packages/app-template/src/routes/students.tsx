import { Stack, Table, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { pgRest } from '#lib/pg-rest';

export const Route = createFileRoute('/students')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await pgRest
        .from('student_view')
        .select('id, name, selected_class:class_view(id, temporary_name)')
        .order('id', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const rows = useMemo(() => {
    return (data ?? []).map((student) => (
      <Table.Tr key={student.id ?? Math.random()}>
        <Table.Td>{student.id ?? '-'}</Table.Td>
        <Table.Td>{student.name ?? '-'}</Table.Td>
        {/** biome-ignore lint/style/noNonNullAssertion: The column
         * education.student.selected_class is NOT NULL, but type generation on
         * public.student_view (or any view) makes all columns optional.
         * See https://github.com/orgs/supabase/discussions/14151. */}
        <Table.Td>{student.selected_class!.temporary_name ?? '-'}</Table.Td>
      </Table.Tr>
    ));
  }, [data]);

  return (
    <Stack>
      <Title order={1}>Registered Students</Title>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {(error as Error).message}</div>
      ) : (
        <Table striped withTableBorder highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Selected Class</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
