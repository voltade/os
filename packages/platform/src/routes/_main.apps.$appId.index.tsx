import { createFileRoute } from '@tanstack/react-router';
import { loadMicroApp } from '@voltade/qiankun';
import { useEffect, useRef } from 'react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
// import { useQiankunMicroApp } from '#src/hooks/qiankun.ts';
import { authClient } from '#src/lib/auth.ts';
import { ENVIRONMENT_ID, ENVIRONMENT_SLUG } from '#src/main.tsx';

export const Route = createFileRoute('/_main/apps/$appId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const { appId } = Route.useParams();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const { data: appInstallations } = useAppInstallations(ENVIRONMENT_ID);

  // const { isLoading, error } = useQiankunMicroApp({
  //   appContainerRef,
  //   appId: app?.app.id,
  //   appSlug: app?.app.slug,
  //   orgSlug: activeOrganization?.slug,
  //   envSlug: ENVIRONMENT_SLUG,
  //   appBuildId: app?.app_installation.app_build_id,
  //   baseUrl: `${window.location.origin}/apps/${appId}`,
  // });

  useEffect(() => {
    if (!appContainerRef.current) return;
    if (!activeOrganization) return;
    const app = appInstallations?.find((app) => app.app.id === appId);
    if (!app) return;
    const microApp = loadMicroApp(
      {
        name: app?.app.slug ?? '',
        entry: `//${activeOrganization.slug}-${ENVIRONMENT_SLUG}.127.0.0.1.nip.io/apps/${app.app.id}/${app.app_installation.app_build_id}/`,
        container: appContainerRef.current,
        props: {
          baseUrl: `${window.location.origin}/apps/${app.app.id}`,
        },
      },
      { sandbox: false },
      {
        beforeLoad: async (app) => {
          console.log('beforeLoad', app);
        },
        beforeMount: async (app) => {
          console.log('beforeMount', app);
        },
        afterMount: async (app) => {
          console.log('afterMount', app);
        },
        beforeUnmount: async (app) => {
          console.log('beforeUnmount', app);
        },
        afterUnmount: async (app) => {
          console.log('afterUnmount', app);
        },
      },
    );
    return () => {
      microApp.unmount();
    };
  }, [appInstallations, activeOrganization, appId]);

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
