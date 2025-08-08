import { createFileRoute } from '@tanstack/react-router';
import { loadMicroApp } from '@voltade/qiankun';
import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/_main/applications')({
  component: RouteComponent,
});

function RouteComponent() {
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const microApp = loadMicroApp(
      {
        name: '@voltade/app-template',
        entry: '//app-template.127.0.0.1.nip.io',
        container: appContainerRef.current!,
      },
      { sandbox: true },
    );
    return () => {
      microApp.unmount();
    };
  }, []);

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
