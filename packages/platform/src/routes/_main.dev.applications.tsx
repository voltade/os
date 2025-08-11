import { createFileRoute } from '@tanstack/react-router';
import { loadMicroApp } from '@voltade/qiankun';
import { useEffect, useRef } from 'react';

import { AccessDenied } from '#src/components/utils/access-denied';
import { authClient } from '#src/lib/auth.ts';

export const Route = createFileRoute('/_main/dev/applications')({
  component: RouteComponent,
});

function RouteComponent() {
  const appContainerRef = useRef<HTMLDivElement>(null);

  const { data: organisation } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const currentUserMember = organisation?.members?.find(
    (m) => m.userId === session?.user?.id,
  );
  const role = currentUserMember?.role;
  const isAllowed = role === 'owner' || role === 'developer';

  useEffect(() => {
    if (!isAllowed) return;
    if (!appContainerRef.current) return;
    const microApp = loadMicroApp(
      {
        name: '@voltade/app-template',
        entry: '//app-template.127.0.0.1.nip.io',
        container: appContainerRef.current,
      },
      { sandbox: false },
    );
    return () => {
      microApp.unmount();
    };
  }, [isAllowed]);

  if (!isAllowed) return <AccessDenied />;

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
