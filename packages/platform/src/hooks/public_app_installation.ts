import { useQuery } from '@tanstack/react-query';

import { api } from '#src/lib/api.ts';

export const usePublicInstallation = (
  organisationSlug: string,
  appSlug: string,
) => {
  return useQuery({
    queryKey: ['publicInstallation', organisationSlug, appSlug],
    queryFn: async () => {
      const res = await api.app_installation.public.$get({
        query: { organizationSlug: organisationSlug, appSlug },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    enabled: Boolean(organisationSlug && appSlug),
  });
};
