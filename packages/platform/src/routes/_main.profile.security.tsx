import { createFileRoute } from '@tanstack/react-router';

import { ProfileSecurity } from '#src/components/ui/profile/Security';

export const Route = createFileRoute('/_main/profile/security')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfileSecurity />;
}
