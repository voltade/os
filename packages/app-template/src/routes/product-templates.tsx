import { Stack, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import ProductTemplatesTable from '#components/ProductTemplatesTable/ProductTemplatesTable.tsx';

export const Route = createFileRoute('/product-templates')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack>
      <Title order={1}>Product Templates</Title>
      <ProductTemplatesTable />
    </Stack>
  );
}
