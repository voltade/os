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
  const { app } = appInstallation ?? {};

  const { containerRef, isLoading } = useMicroApp({
    enabled: !!activeOrganization && !!environment.slug && !!appInstallation,
    name: slug,
    entry: `//${activeOrganization?.slug}-${environment.slug}.127.0.0.1.nip.io/apps/${app?.slug}/`,
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
