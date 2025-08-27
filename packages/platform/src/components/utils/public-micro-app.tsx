import { LoaderComponent } from '#src/components/utils/app-loader.tsx';
import { usePublicInstallation } from '#src/hooks/public_app_installation.ts';
import { useMicroApp } from '#src/hooks/useMicroApp.ts';

interface Props {
  appSlug: string;
  organizationSlug: string;
}

export function PublicMicroApp({ appSlug, organizationSlug }: Props) {
  const { data: appInstallation } = usePublicInstallation(
    organizationSlug,
    appSlug,
  );

  const { app, environment } = appInstallation ?? {};

  const { containerRef, isLoading } = useMicroApp({
    enabled: !!environment?.slug && !!appInstallation,
    name: appSlug,
    entry: `//runner.${organizationSlug}-${environment?.slug}.127.0.0.1.nip.io/apps/${app?.slug}/`,
  });

  return (
    <>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <LoaderComponent loading={!environment?.slug || isLoading} />
    </>
  );
}
