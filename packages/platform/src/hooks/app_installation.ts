import { useQuery } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export type AppInstallation = NonNullable<
  Awaited<ReturnType<typeof useAppInstallations>>['data']
>[number];

export const useAppInstallations = (environmentId: string) => {
  return useQuery({
    queryKey: ['appInstallations', environmentId],
    queryFn: async () => {
      const res = await api.app_installation.$get({
        query: {
          environment_id: environmentId,
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const data = await res.json();
      return data;
    },
  });
};
