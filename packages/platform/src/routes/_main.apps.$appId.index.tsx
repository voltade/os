import { createFileRoute } from '@tanstack/react-router';
import { useRef } from 'react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { useQiankunMicroApp } from '#src/hooks/qiankun.ts';
import { authClient } from '#src/lib/auth.ts';
import { ENVIRONMENT_ID, ENVIRONMENT_SLUG } from '#src/main.tsx';

export const Route = createFileRoute('/_main/apps/$appId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const { data: appInstallations } = useAppInstallations(ENVIRONMENT_ID);

  const { isLoading, error: appError } = useQiankunMicroApp({
    appContainerRef,
    orgSlug: activeOrganization?.slug,
    envSlug: ENVIRONMENT_SLUG,
    microApps:
      appInstallations?.map((app) => ({
        appName: app.app.slug,
        appId: app.app.id,
        releaseId: app.app_installation.app_build_id,
        props: {
          baseUrl: `${window.location.origin}/apps/${app.app.id}`,
        },
      })) ?? [],
  });

  return (
    <>
      <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
      {isLoading && <div>Loading...</div>}
      {appError && <div>Error: {appError}</div>}
    </>
  );
}
