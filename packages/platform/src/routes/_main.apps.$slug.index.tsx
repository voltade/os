import { createFileRoute } from '@tanstack/react-router';

import { MicroApp } from '#src/components/utils/micro-app.tsx';

export const Route = createFileRoute('/_main/apps/$slug/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  return <MicroApp slug={slug} />;
}
