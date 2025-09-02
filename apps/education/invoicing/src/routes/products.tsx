import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { pgRest } from '#src/lib/pg-rest.ts';

export const Route = createFileRoute('/products')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['product-templates'],
    queryFn: async () => {
      const res = await pgRest.from('product_template_view').select('*');
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  if (isLoading)
    return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;
  if (isError)
    return (
      <pre className="p-4 text-xs text-destructive whitespace-pre-wrap">
        {String(error)}
      </pre>
    );

  return (
    <pre className="p-4 text-xs whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
