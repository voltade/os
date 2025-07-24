import { Stack, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import ProductTemplatesSupabaseTable from '#components/ProductTemplatesTable/ProductTemplatesSupabaseTable.tsx';
//import ProductTemplatesTable from '#components/ProductTemplatesTable/ProductTemplatesTable.tsx';

export const Route = createFileRoute('/product-templates')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack>
      <Title order={1}>Product Templates</Title>
      <ProductTemplatesSupabaseTable />
    </Stack>
  );
}
