import { createFileRoute } from '@tanstack/react-router';

import { ProfileGeneral } from '#src/components/ui/profile/General';

export const Route = createFileRoute('/_main/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfileGeneral />;
}
