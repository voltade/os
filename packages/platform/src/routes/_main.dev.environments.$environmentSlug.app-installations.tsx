import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_main/dev/environments/$environmentSlug/app-installations',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Hello "/_main/dev/environments/$environmentSlug/app-installations"!
    </div>
  );
}
