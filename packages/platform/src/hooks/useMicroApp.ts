import {
  type FrameworkConfiguration,
  loadMicroApp,
  type MicroApp,
} from 'qiankun';
import { useEffect, useRef, useState } from 'react';

interface UseMicroAppOptions {
  enabled: boolean;
  name: string;
  entry: string;
  config?: FrameworkConfiguration;
}

export function useMicroApp({ enabled, name, entry }: UseMicroAppOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const microAppRef = useRef<MicroApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!containerRef.current) {
      return;
    }
    if (microAppRef.current) {
      return;
    }
    const microApp = loadMicroApp(
      { container: containerRef.current, name, entry },
      { sandbox: true },
      {
        beforeLoad: async (app) => {
          console.log('beforeLoad', app.name);
        },
        beforeMount: async (app) => {
          console.log('beforeMount', app.name);
        },
        afterMount: async (app) => {
          console.log('afterMount', app.name);
          setIsLoading(false);
        },
        beforeUnmount: async (app) => {
          console.log('beforeUnmount', app.name);
        },
        afterUnmount: async (app) => {
          console.log('afterUnmount', app.name);
        },
      },
    );
    microAppRef.current = microApp;
    return () => {
      microApp.unmount().then(() => {
        setIsLoading(false);
      });
      microAppRef.current = null;
    };
  }, [enabled, name, entry]);

  return { containerRef, microAppRef, isLoading };
}
