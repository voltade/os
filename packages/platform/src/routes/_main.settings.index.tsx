import { createFileRoute } from '@tanstack/react-router';

import { ProfileGeneral } from '#src/components/ui/profile/General';

export const Route = createFileRoute('/_main/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfileGeneral />;
}
