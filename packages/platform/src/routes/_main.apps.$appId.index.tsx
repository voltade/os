import { createFileRoute } from '@tanstack/react-router';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { useQiankunMicroApp } from '#src/hooks/qiankun.ts';
import { authClient } from '#src/lib/auth.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

export const Route = createFileRoute('/_main/apps/$appId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { environment } = usePlatformStore();
  const { data: appInstallations } = useAppInstallations(environment.id);
  const { appId } = Route.useParams();

  const app = appInstallations?.find((app) => app.app.id === appId);
  const { appContainerRef } = useQiankunMicroApp({ app, activeOrganization });

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
