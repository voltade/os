import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_main/dev/applications')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_main/dev/applications"!</div>;
}
