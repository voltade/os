import { useQuery } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export const useApps = (orgId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['apps', orgId],
    queryFn: async () => {
      const res = await api.app.$get({
        query: { org_id: orgId },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data as Array<{
        id: string;
        name: string | null;
        slug: string | null;
        organization_id: string;
      }>;
    },
    enabled: (options?.enabled ?? true) && !!orgId,
  });
};
