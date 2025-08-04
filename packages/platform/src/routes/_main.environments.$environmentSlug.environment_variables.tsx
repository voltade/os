import { createFileRoute } from '@tanstack/react-router';

import { EnvironmentVariablesTable } from '#src/components/ui/environment/index.ts';
import { useEnvironment } from '#src/hooks/environment.ts';

export const Route = createFileRoute(
  '/_main/environments/$environmentSlug/environment_variables',
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { environmentSlug } = Route.useParams();
  const { data: environment } = useEnvironment(environmentSlug);

  if (!environment) {
    return <div>Environment not found</div>;
  }

  return <EnvironmentVariablesTable environmentId={environment.id} />;
}
