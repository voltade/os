// import { registerMicroApps, start } from '@voltade/qiankun';
// import { useEffect, useState } from 'react';

// interface RequiredMicroAppProps {
//   baseUrl: string;
// }

// interface UseQiankunMicroAppProps<T = {}> {
//   appContainerRef: React.RefObject<HTMLDivElement | null>;
//   orgSlug?: string;
//   envSlug?: string;
//   microApps: MicroApps<T>[];
// }

// interface MicroApps<T = {}> {
//   appName: string;
//   appId: string;
//   releaseId: string;
//   props: RequiredMicroAppProps & T;
// }
// export function useQiankunMicroApp({
//   appContainerRef,
//   microApps,
//   orgSlug,
//   envSlug,
// }: UseQiankunMicroAppProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (appContainerRef.current === null) {
//       console.error('App container ref is null');
//       setError('Container reference not found');
//       setIsLoading(false);
//       return;
//     }

//     if (!orgSlug || !envSlug) {
//       return;
//     }

//     const container = appContainerRef.current;

//     registerMicroApps(
//       microApps.map((microApp) => ({
//         name: microApp.appName,
//         entry: `//${orgSlug}-${envSlug}.127.0.0.1.nip.io/apps/${microApp.appId}/${microApp.releaseId}/index.html`,
//         container,
//         activeRule: [`/apps/${microApp.appId}/`, `/apps/${microApp.appId}`],
//         props: {
//           ...microApp.props,
//         },
//       })),
//       {
//         beforeLoad: async () => {
//           console.log('beforeLoad');
//           setIsLoading(true);
//         },
//         beforeMount: async () => {
//           console.log('beforeMount');
//         },
//         afterMount: async () => {
//           console.log('afterMount');
//           setIsLoading(false);
//           setError(null);
//         },
//         beforeUnmount: async () => {
//           console.log('beforeUnmount');
//         },
//         afterUnmount: async () => {
//           console.log('afterUnmount');
//         },
//       },
//     );

//     start();
//   }, [appContainerRef, microApps, orgSlug, envSlug]);

//   return { isLoading, error };
// }

import { loadMicroApp } from '@voltade/qiankun';
import { useEffect, useState } from 'react';

interface UseQiankunMicroAppProps {
  appContainerRef: React.RefObject<HTMLDivElement | null>;
  appId?: string;
  appSlug?: string;
  orgSlug?: string;
  envSlug?: string;
  appBuildId?: string;
  baseUrl?: string;
}

export function useQiankunMicroApp({
  appContainerRef,
  appId,
  appSlug,
  orgSlug,
  envSlug,
  appBuildId,
  baseUrl,
}: UseQiankunMicroAppProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appContainerRef.current) return;
    if (!appId || !appSlug || !orgSlug || !envSlug || !appBuildId) return;

    setIsLoading(true);
    setError(null);

    const microApp = loadMicroApp(
      {
        name: appSlug,
        entry: `//${orgSlug}-${envSlug}.127.0.0.1.nip.io/apps/${appId}/${appBuildId}/`,
        container: appContainerRef.current,
        props: {
          baseUrl: baseUrl || `${window.location.origin}/apps/${appId}`,
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
          setIsLoading(false);
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
  }, [appContainerRef, appId, appSlug, orgSlug, envSlug, appBuildId, baseUrl]);

  return { isLoading, error };
}
