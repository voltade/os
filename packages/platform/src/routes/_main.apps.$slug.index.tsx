import { createFileRoute } from '@tanstack/react-router';

import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { useQiankunMicroApp } from '#src/hooks/useQiankunMicroApp.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

export const Route = createFileRoute('/_main/apps/$slug/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { environment } = usePlatformStore();
  const { data: appInstallations } = useAppInstallations(environment.id);
  const { slug } = Route.useParams();

  const appInstallation = appInstallations?.find(
    ({ app }) => app.slug === slug,
  );
  const { appContainerRef } = useQiankunMicroApp({
    isTemplate: slug === 'app-template',
    appInstallation,
  });

  return (
    <div ref={appContainerRef} style={{ width: '100%', height: '100%' }} />
  );
}
