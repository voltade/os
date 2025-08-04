import { createFileRoute } from '@tanstack/react-router';

import { useEnvironment } from '#src/hooks/environment.ts';

export const Route = createFileRoute('/_main/environments/$environmentSlug/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const { data, isLoading } = useEnvironment(environmentSlug);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!data) {
    return <div>No data</div>;
  }
  return <div>{data.name}</div>;
}
