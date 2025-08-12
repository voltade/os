import { registerMicroApps, start } from '@voltade/qiankun';
import { useEffect, useState } from 'react';

interface RequiredMicroAppProps {
  baseUrl: string;
}

interface UseQiankunMicroAppProps<T = {}> {
  appContainerRef: React.RefObject<HTMLDivElement | null>;
  orgSlug?: string;
  envSlug?: string;
  microApps: MicroApps<T>[];
}

interface MicroApps<T = {}> {
  appName: string;
  appId: string;
  releaseId: string;
  props: RequiredMicroAppProps & T;
}
export function useQiankunMicroApp({
  appContainerRef,
  microApps,
  orgSlug,
  envSlug,
}: UseQiankunMicroAppProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appContainerRef.current === null) {
      console.error('App container ref is null');
      setError('Container reference not found');
      setIsLoading(false);
      return;
    }

    if (!orgSlug || !envSlug) {
      return;
    }

    const container = appContainerRef.current;

    registerMicroApps(
      microApps.map((microApp) => ({
        name: microApp.appName,
        entry: `//${orgSlug}-${envSlug}.127.0.0.1.nip.io/apps/${microApp.appId}/${microApp.releaseId}/index.html`,
        container,
        activeRule: [`/apps/${microApp.appId}/`, `/apps/${microApp.appId}`],
        props: {
          ...microApp.props,
        },
      })),
      {
        beforeLoad: async () => {
          console.log('beforeLoad');
          setIsLoading(true);
        },
        beforeMount: async () => {
          console.log('beforeMount');
        },
        afterMount: async () => {
          console.log('afterMount');
          setIsLoading(false);
          setError(null);
        },
        beforeUnmount: async () => {
          console.log('beforeUnmount');
        },
        afterUnmount: async () => {
          console.log('afterUnmount');
        },
      },
    );

    start();
  }, [appContainerRef, microApps, orgSlug, envSlug]);

  return { isLoading, error };
}
