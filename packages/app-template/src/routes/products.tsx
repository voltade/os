import { Code, Stack, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { api } from '#lib/api.ts';

export const Route = createFileRoute('/products')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.product.$get({
        query: { page: '1', limit: '10' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Stack>
      <Title order={1}>Products</Title>
      <Code block>{JSON.stringify(data, null, 2)}</Code>
    </Stack>
  );
}
