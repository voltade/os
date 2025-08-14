import { createFileRoute } from '@tanstack/react-router';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { useQiankunMicroApp } from '#src/hooks/qiankun.ts';
import { authClient } from '#src/lib/auth.ts';
import { ENVIRONMENT_ID } from '#src/main.tsx';

export const Route = createFileRoute('/_main/apps/$appId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: appInstallations } = useAppInstallations(ENVIRONMENT_ID);
  const { appId } = Route.useParams();

  const app = appInstallations?.find((app) => app.app.id === appId);
  const { appContainerRef } = useQiankunMicroApp({ app, activeOrganization });

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
