import { loadMicroApp, type MicroApp } from 'qiankun';
import { useEffect, useRef } from 'react';

import type { AppInstallation } from '#src/hooks/app_installation.ts';
import { ENVIRONMENT_SLUG } from '#src/main.tsx';

interface UseQiankunMicroAppOptions {
  app: AppInstallation | undefined;
  activeOrganization: { slug: string } | undefined | null;
}

export function useQiankunMicroApp({
  app,
  activeOrganization,
}: UseQiankunMicroAppOptions) {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);

  useEffect(() => {
    if (!appContainerRef.current) return;
    if (!activeOrganization) return;
    if (!app) return;

    const microApp = loadMicroApp(
      {
        name: app.app.slug ?? '',
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

    microAppRef.current = microApp;

    return () => {
      microApp.unmount();
      microAppRef.current = null;
    };
  }, [app, activeOrganization]);

  return { appContainerRef };
}
