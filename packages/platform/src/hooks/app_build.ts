import { useQuery } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export const useAppBuilds = (
  appId: string,
  orgId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['appBuilds', appId, orgId],
    queryFn: async () => {
      const res = await api.app_build.$get({
        query: { appId, orgId },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data as Array<{
        id: string;
        app_id: string;
        organization_id: string;
        status: 'pending' | 'building' | 'ready' | 'error';
        artifact_url: string | null;
        created_at: string | null;
        updated_at: string | null;
      }>;
    },
    enabled: (options?.enabled ?? true) && !!appId && !!orgId,
  });
};
