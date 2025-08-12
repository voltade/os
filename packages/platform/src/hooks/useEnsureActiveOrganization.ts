import { useEffect, useRef } from 'react';

import { authClient } from '#src/lib/auth.ts';

/**
 * Ensures there is an active organization set in Better Auth.
 * If none is set, this will set the first available organization as active.
 *
 * TODO: This should be handled better on the server or via a dedicated UX flow
 * (e.g., choose org on first login, remember last selection, etc.).
 */
export function useEnsureActiveOrganization() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: allOrgs } = authClient.useListOrganizations();

  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;

    // If we have no active org but we have organizations available, set the first one
    if (!activeOrg && Array.isArray(allOrgs) && allOrgs.length > 0) {
      const first = allOrgs[0];
      attemptedRef.current = true;
      void authClient.organization.setActive({ organizationId: first.id });
    }
  }, [activeOrg, allOrgs]);
}
