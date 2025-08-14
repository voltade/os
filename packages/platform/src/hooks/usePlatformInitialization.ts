import { useEffect } from 'react';

import { useEnvironments } from '#src/hooks/environment.ts';
import { authClient } from '#src/lib/auth.ts';
import { usePlatformStore } from '#src/stores/usePlatformStore.ts';

/**
 * Initializes the platform store with the production environment
 * when the user first logs in. Only makes the environments DB call once.
 */
export function usePlatformInitialization() {
  const { isInitialized, initializeWithProduction } = usePlatformStore();
  const { data: activeOrg } = authClient.useActiveOrganization();

  // Only fetch environments if we have an active org and the platform store hasn't been initialized yet
  const shouldFetch = !isInitialized && !!activeOrg?.id;
  const { data: environments } = useEnvironments(
    activeOrg?.id ?? '',
    shouldFetch,
  );

  useEffect(() => {
    if (environments && !isInitialized) {
      initializeWithProduction(environments);
    }
  }, [environments, isInitialized, initializeWithProduction]);
}
