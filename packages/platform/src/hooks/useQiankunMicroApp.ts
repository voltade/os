import { type LoadableApp, loadMicroApp, type MicroApp } from 'qiankun';
import { useEffect, useRef } from 'react';

import type { AppInstallation } from '#src/hooks/app_installation.ts';
import { authClient } from '#src/lib/auth.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

interface UseQiankunMicroAppOptions {
  isTemplate?: boolean;
  appInstallation: AppInstallation | undefined;
}

export function useQiankunMicroApp({
  isTemplate,
  appInstallation,
}: UseQiankunMicroAppOptions) {
  const appContainerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const { environment } = usePlatformStore();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  useEffect(() => {
    if (!appContainerRef.current) return;
    if (!activeOrganization?.slug) return;
    if (!environment.slug) return;
    if (!isTemplate && !appInstallation) return;

    let loadableApp: LoadableApp<{ baseUrl: string }>;
    if (isTemplate) {
      const entry = '//app-template.127.0.0.1.nip.io/';
      loadableApp = {
        container: appContainerRef.current,
        name: 'app-template',
        entry,
        props: {
          baseUrl: `http:${entry}`,
        },
      };
    } else if (appInstallation) {
      const { app, app_installation } = appInstallation;
      const entry = `//${activeOrganization.slug}-${environment.slug}.127.0.0.1.nip.io/apps/${app.id}/${app_installation.app_build_id}/`;
      loadableApp = {
        container: appContainerRef.current,
        name: app.slug ?? '',
        entry,
        props: {
          baseUrl: `http:${entry}`,
        },
      };
    } else {
      return;
    }

    const microApp = loadMicroApp(
      loadableApp,
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
  }, [isTemplate, appInstallation, activeOrganization?.slug, environment.slug]);

  return { appContainerRef };
}
