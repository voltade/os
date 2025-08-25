import { LoaderComponent } from '#src/components/utils/app-loader.tsx';
import { useAppInstallations } from '#src/hooks/app_installation.ts';
import { useMicroApp } from '#src/hooks/useMicroApp.ts';
import { authClient } from '#src/lib/auth.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

interface Props {
  slug: string;
}

export function MicroApp({ slug }: Props) {
  const { environment } = usePlatformStore();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const { data: appInstallations } = useAppInstallations(environment.id);

  const appInstallation = appInstallations?.find(
    ({ app }) => app.slug === slug,
  );
  const { app, app_installation } = appInstallation ?? {};
  const isTemplateApp = slug === 'app-template';

  const { containerRef, isLoading } = useMicroApp({
    enabled:
      !!activeOrganization &&
      !!environment.slug &&
      (isTemplateApp || !!appInstallation),
    name: slug,
    entry:
      slug === 'app-template'
        ? '//app-template.127.0.0.1.nip.io/'
        : `//${activeOrganization?.slug}-${environment.slug}.127.0.0.1.nip.io/apps/${app?.id}/${app_installation?.app_build_id}/`,
  });

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <LoaderComponent
        loading={!activeOrganization || !environment.slug || isLoading}
      />
    </>
  );
}
