import { createFileRoute } from '@tanstack/react-router';
import { loadMicroApp } from '@voltade/qiankun';
import { useEffect, useRef } from 'react';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { ENVIRONMENT_ID } from '#src/main.tsx';

export const Route = createFileRoute('/_main/$appId')({
  component: RouteComponent,
});

function RouteComponent() {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const { appId } = Route.useParams();

  const { data: appInstallations } = useAppInstallations(ENVIRONMENT_ID);

  const buildId = appInstallations?.find((app) => app.app.id === appId)
    ?.app_installation.app_build_id;
  console.log(buildId);

  useEffect(() => {
    if (!appContainerRef.current || !buildId) return;
    const microApp = loadMicroApp(
      {
        name: '@voltade/app-template',
        entry: `//voltade-main.127.0.0.1.nip.io/apps/${appId}/${buildId}`,
        container: appContainerRef.current,
        props: {
          baseUrl: `${window.location.origin}/${appId}`,
        },
      },
      { sandbox: true },
    );
    return () => {
      microApp.unmount();
    };
  }, [appId, buildId]);

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
