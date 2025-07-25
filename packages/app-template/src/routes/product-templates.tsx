import { Stack, Title } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';

import ProductTemplatesMRT from '#components/ProductTemplatesTable/ProductTemplatesMRT.tsx';

export const Route = createFileRoute('/product-templates')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Stack>
      <Title order={1}>Product Templates</Title>
      <ProductTemplatesMRT />
    </Stack>
  );
}
